package com.example.backend.features.showtimes.DTOs;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.example.backend.features.showtime_seats.DTOs.ShowtimeSeatSummary;

public record ShowtimeAndSeatsResponse(
    Long id,
    Long movie,
    Long room,
    LocalDateTime startTime,
    LocalDateTime endTime,
    BigDecimal price,
    List<ShowtimeSeatSummary> seats) {
}
