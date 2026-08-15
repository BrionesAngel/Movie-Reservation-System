package com.example.backend.features.reservations.DTOs;

import java.util.List;


import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record ReservationRequest(
  @NotNull(message = "showtimeId required") Long showtimeId,
  @NotEmpty(message = "must select at least 1 seat") List<Long> seatsId
) {}
