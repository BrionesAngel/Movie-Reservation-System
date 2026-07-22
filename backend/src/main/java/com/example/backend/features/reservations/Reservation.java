package com.example.backend.features.reservations;

import java.time.LocalDateTime;
import java.util.List;

import com.example.backend.features.showtimes.Showtime;
import com.example.backend.features.showtimeseats.ShowtimeSeat;
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

  @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<ShowtimeSeat> seats;

  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private ReservationStatus status;
 
  @Column(nullable = false)
  private Double totalPrice;
}
