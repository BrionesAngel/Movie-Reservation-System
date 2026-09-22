package com.example.backend.core.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.example.backend.features.reservations.events.SeatsReleasedEvent;
import com.example.backend.features.reservations.events.SeatsReservedEvent;
import com.example.backend.features.showtime_seats.ShowtimeSeatEventType;
import com.example.backend.features.showtime_seats.DTOs.SeatEvent;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class WebSocketEventDispatcher {
  private final SimpMessagingTemplate messagingTemplate;

  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void onSeatsReserved(SeatsReservedEvent event) {
    String topic = "/topic/showtimes/" + event.showtimeId();

    event.seatIds().forEach(seatId -> {
      SeatEvent payload = new SeatEvent(ShowtimeSeatEventType.SEAT_RESERVED.name(), seatId);
      messagingTemplate.convertAndSend(topic, payload);
    });
  }

  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void onSeatsReleased(SeatsReleasedEvent event) {
    String topic = "/topic/showtimes/" + event.showtimeId();

    event.seatIds().forEach(seatId -> {
      SeatEvent payload = new SeatEvent(ShowtimeSeatEventType.SEAT_RELEASED.name(), seatId);
      messagingTemplate.convertAndSend(topic, payload);
    });
  }
}
