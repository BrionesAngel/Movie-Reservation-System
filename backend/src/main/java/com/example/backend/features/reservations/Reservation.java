package com.example.backend.features.reservations;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.example.backend.features.payments.Payment;
import com.example.backend.features.showtime_seats.ShowtimeSeat;
import com.example.backend.features.showtimes.Showtime;
import com.example.backend.features.users.User;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "reservations")
public class Reservation {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "showtime_id", nullable = false)
  private Showtime showtime;

  @OneToMany(mappedBy = "reservation")
  private List<ShowtimeSeat> seats;

  @Column(nullable = false, length = 15)
  @Enumerated(EnumType.STRING)
  private ReservationStatus status;

  @Column(nullable = false, updatable = false)
  private Instant createdAt;

  @Column(nullable = false)
  private Instant reserveUntil;

  @Column(nullable = false)
  private BigDecimal totalPrice;

  @OneToOne(mappedBy = "reservation")
  private Payment payment;
}
