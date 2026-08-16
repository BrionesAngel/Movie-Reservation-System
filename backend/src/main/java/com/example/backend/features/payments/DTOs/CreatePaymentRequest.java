package com.example.backend.features.payments.DTOs;

public record CreatePaymentRequest(
    Long showtimeId,
    Short quantity) {
}
