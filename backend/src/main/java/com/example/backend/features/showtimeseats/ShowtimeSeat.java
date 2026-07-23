package com.example.backend.features.showtimeseats;

import com.example.backend.features.reservations.Reservation;
import com.example.backend.features.seats.Seat;
import com.example.backend.features.showtimes.Showtime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "showtime_seats")
public class ShowtimeSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private ShowtimeSeatStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "showtime_id", nullable = false)
    private Showtime showtime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;
}
