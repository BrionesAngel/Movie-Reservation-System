package com.example.backend.features.showtimes.DTOs;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ShowtimeResponse(
  Long id,
  Long movie,
  Long room,
  LocalDateTime startTime,
  LocalDateTime endTime,
  BigDecimal price
) {}
