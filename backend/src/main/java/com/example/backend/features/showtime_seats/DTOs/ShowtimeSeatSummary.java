package com.example.backend.features.showtime_seats.DTOs;

import com.example.backend.features.showtime_seats.ShowtimeSeatStatus;

public record ShowtimeSeatSummary(
  Long id,
  String row,
  Short number,
  ShowtimeSeatStatus status
) {}
