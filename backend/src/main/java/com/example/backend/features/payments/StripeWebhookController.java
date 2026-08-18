package com.example.backend.features.payments;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.features.reservations.ReservationService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/webhooks")
public class StripeWebhookController {

  @Value("${stripe.webhook-secret}")
  private String webhookSecret;

  private final PaymentService paymentService;
  private final ReservationService reservationService;

  @PostMapping("/stripe")
  public String handleWebhook(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader)
      throws SignatureVerificationException {

    Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
    Payment payment;

    switch (event.getType()) {
      case "payment_intent.succeeded":
        payment = paymentService.markAsPaid(paymentService.getPaymentIntentId(event));
        reservationService.markReservationAsBooked(payment.getReservation().getId());
        break;

      case "payment_intent.payment_failed":
        payment = paymentService.markAsFailed(paymentService.getPaymentIntentId(event));
        reservationService.markReservationAsCanceledIfExpired(payment.getReservation().getId());
        break;

      case "payment_intent.canceled":
        payment = paymentService.markAsCanceled(paymentService.getPaymentIntentId(event));
        reservationService.markReservationAsCanceled(payment.getReservation().getId());
        break;

      default:
        break;
    }

    return "received";

  }

}
