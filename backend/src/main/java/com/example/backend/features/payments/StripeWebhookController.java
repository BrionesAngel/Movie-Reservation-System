package com.example.backend.features.payments;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/webhooks")
public class StripeWebhookController {

  @Value("${stripe.webhook.secret}")
  private String webhookSecret;

  private PaymentService paymentService;

  @PostMapping("/stripe")
  public String handleWebhook(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader)
      throws SignatureVerificationException {

    Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

    if ("payment_intent.succeeded".equals(event.getType())) {
      StripeObject stripeObject = event.getDataObjectDeserializer().getObject().orElseThrow();
      PaymentIntent intent = (PaymentIntent) stripeObject;
      paymentService.markAsPaid(intent.getId());
    }

    return "received";

  }
}
