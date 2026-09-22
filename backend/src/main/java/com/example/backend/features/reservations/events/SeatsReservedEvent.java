package com.example.backend.features.reservations.events;

import java.util.List;

public record SeatsReservedEvent(
    Long showtimeId,
    List<Long> seatIds) {
}
