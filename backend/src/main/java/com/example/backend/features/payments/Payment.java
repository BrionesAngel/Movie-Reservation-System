package com.example.backend.features.payments;

import java.time.Instant;

import com.example.backend.features.reservations.Reservation;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "payments")
public class Payment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne
  @JoinColumn(name = "reservation_id")
  private Reservation reservation;

  @Column(name = "stripe_payment_intent_id",length = 50, nullable = false, unique = true)
  private String stripePaymentIntentId;

  @Column(nullable = false)
  private Long amount;

  @Column(length = 3, nullable = false)
  private String currency;

  @Enumerated(EnumType.STRING)
  @Column(length = 15, nullable = false)
  private PaymentStatus status;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at")
  private Instant updatedAt;

}
