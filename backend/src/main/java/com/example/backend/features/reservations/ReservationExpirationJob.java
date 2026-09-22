package com.example.backend.features.reservations;

import java.time.Instant;
import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.features.showtime_seats.ShowtimeSeatEventType;
import com.example.backend.features.showtime_seats.ShowtimeSeatService;
import com.example.backend.features.showtime_seats.DTOs.SeatEvent;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ReservationExpirationJob {

  private final ReservationRepository reservationRepository;
  private final ShowtimeSeatService showtimeSeatService;
  private final SimpMessagingTemplate messagingTemplate;

  @Scheduled(fixedRate = 60000)
  @Transactional
  public void expireStaleReservations() {
    List<Reservation> expired = reservationRepository
        .findAllByStatusAndReserveUntilBeforeWithSeats(ReservationStatus.RESERVED, Instant.now());

    expired.forEach(r -> {
      r.setStatus(ReservationStatus.CANCELED);
      showtimeSeatService.markSeatsAsAvailable(r.getSeats());

      r.getSeats().forEach(seat -> {
        String topic = "/topic/showtimes/" + seat.getShowtime().getId();
        SeatEvent payload = new SeatEvent(ShowtimeSeatEventType.SEAT_RELEASED.name(), seat.getId());
        messagingTemplate.convertAndSend(topic, payload);
      });
    });
  }
}
