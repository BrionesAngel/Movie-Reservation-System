package com.example.backend.features.reservations.events;

import java.util.List;

public record SeatsReleasedEvent(
    Long showtimeId,
    List<Long> seatIds) {
}
