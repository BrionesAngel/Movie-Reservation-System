package com.example.backend.features.showtimes.DTOs;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

public record CreateShowtimeRequest(
  @NotNull(message = "movieId is required")
  Long movieId,

  @NotNull(message = "roomId is required")
  Long roomId,

  @NotNull(message = "startTime is required")
  @FutureOrPresent(message = "startTime cannot be in the past")
  LocalDateTime startTime,

  @NotNull(message = "price is required")
  @DecimalMin(value = "0.0", inclusive = false, message = "price must be greater than 0")
  BigDecimal price
) {}
