package com.example.backend.features.payments;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.features.payments.DTOs.CreatePaymentResponse;
import com.example.backend.features.payments.exceptions.PaymentProcessingException;
import com.example.backend.features.reservations.Reservation;
import com.example.backend.features.reservations.ReservationService;
import com.example.backend.shared.exceptions.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

  private final PaymentRepository paymentRepository;
  private final ReservationService reservationService;

  public CreatePaymentResponse createPayment(long amount, Reservation reservation) {
    PaymentIntent intent;
    try {
      PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
          .setAmount(amount)
          .setCurrency("mxn")
          .setAutomaticPaymentMethods(
              PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                  .setEnabled(true)
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

  @Transactional
  public void markAsPaid(String stripePaymentIntentId) {
    Payment payment = paymentRepository.findByStripePaymentIntentId(stripePaymentIntentId)
        .orElseThrow(() -> new ResourceNotFoundException("payment not found: " + stripePaymentIntentId));

    payment.setStatus(PaymentStatus.SUCCEEDED);
    reservationService.markReservationAsBooked(payment.getReservation().getId());
    payment.setUpdatedAt(LocalDateTime.now());
  }

}
