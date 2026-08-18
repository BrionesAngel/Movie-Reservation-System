package com.example.backend.features.reservations;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.features.showtime_seats.ShowtimeSeatService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ReservationExpirationJob {

  private final ReservationRepository reservationRepository;
  private final ShowtimeSeatService showtimeSeatService;

  @Scheduled(fixedRate = 60000)
  @Transactional
  public void expireStaleReservations() {
    List<Reservation> expired = reservationRepository
        .findAllByStatusAndReserveUntilBeforeWithSeats(ReservationStatus.RESERVED, LocalDateTime.now());

    expired.forEach(r -> {
      r.setStatus(ReservationStatus.CANCELED);
      showtimeSeatService.markSeatsAsAvailable(r.getSeats());
    });
  }
}
