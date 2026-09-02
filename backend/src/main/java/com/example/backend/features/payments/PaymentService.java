package com.example.backend.features.payments;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.features.payments.DTOs.CreatePaymentResponse;
import com.example.backend.features.payments.exceptions.PaymentProcessingException;
import com.example.backend.features.reservations.Reservation;
import com.example.backend.shared.exceptions.ResourceNotFoundException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.param.PaymentIntentCreateParams;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

  private final PaymentRepository paymentRepository;

  public String getClientSecretByReservationId(Long reservationId) {
    Payment payment = paymentRepository.findByReservationId(reservationId)
        .orElseThrow(() -> new ResourceNotFoundException("payment for reservation: " + reservationId + " not found"));

    try {
      PaymentIntent intent = PaymentIntent.retrieve(payment.getStripePaymentIntentId());
      return intent.getClientSecret();
    } catch (StripeException e) {
      throw new PaymentProcessingException("" + e);
    }
  }

  public CreatePaymentResponse createPayment(long amount, Reservation reservation) {
    PaymentIntent intent;
    try {
      PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
          .setAmount(amount)
          .setCurrency("mxn")
          .setAutomaticPaymentMethods(
              PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                  .setEnabled(true)
                  .setAllowRedirects(PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER)
                  .build())
          .build();
      intent = PaymentIntent.create(params);
    } catch (StripeException e) {
      throw new PaymentProcessingException("" + e);
    }

    Payment payment = Payment.builder()
        .reservation(reservation)
        .stripePaymentIntentId(intent.getId())
        .amount(amount)
        .currency("mxn")
        .status(PaymentStatus.PENDING)
        .createdAt(LocalDateTime.now())
        .build();

    paymentRepository.save(payment);

    return new CreatePaymentResponse(intent.getClientSecret());
  }

  public Payment markAsPaid(String stripePaymentIntentId) {
    return this.getPaymentAndSetStatus(stripePaymentIntentId, PaymentStatus.SUCCEEDED);
  }

  public Payment markAsCanceled(String stripePaymentIntentId) {
    return this.getPaymentAndSetStatus(stripePaymentIntentId, PaymentStatus.CANCELED);
  }

  public Payment markAsFailed(String stripePaymentIntentId) {
    return this.getPaymentAndSetStatus(stripePaymentIntentId, PaymentStatus.FAILED);
  }

  @Transactional
  public Payment getPaymentAndSetStatus(String stripePaymentIntentId, PaymentStatus status) {
    Payment payment = this.getPaymentByPaymentIntentIdOrThrow(stripePaymentIntentId);

    payment.setStatus(status);
    payment.setUpdatedAt(LocalDateTime.now());
    return payment;
  }

  public String getPaymentIntentId(Event event) {
    StripeObject stripeObject = event.getDataObjectDeserializer().getObject().orElseThrow();
    PaymentIntent intent = (PaymentIntent) stripeObject;
    return intent.getId();
  }

  public Payment getPaymentByPaymentIntentIdOrThrow(String stripePaymentIntentId) {
    return paymentRepository.findByStripePaymentIntentId(stripePaymentIntentId)
        .orElseThrow(() -> new ResourceNotFoundException("payment not found: " + stripePaymentIntentId));
  }
}
