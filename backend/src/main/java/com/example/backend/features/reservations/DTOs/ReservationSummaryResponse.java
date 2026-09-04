package com.example.backend.features.reservations.DTOs;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.example.backend.features.payments.PaymentStatus;
import com.example.backend.features.reservations.ReservationStatus;
import com.example.backend.features.showtime_seats.DTOs.ShowtimeSeatSummary;

public record ReservationSummaryResponse(
  Long id,
  Long showtimeId,
  Long userId,
  List<ShowtimeSeatSummary> seats,
  ReservationStatus status,
  PaymentStatus paymentStatus,
  Instant createdAt,
  Instant reserveUntil,
  BigDecimal totalPrice
) {}
