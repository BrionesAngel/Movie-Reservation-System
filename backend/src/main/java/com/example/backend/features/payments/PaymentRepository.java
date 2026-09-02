package com.example.backend.features.payments;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long>{
  Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);
  Optional<Payment> findByReservationId(Long reservationId);
}
