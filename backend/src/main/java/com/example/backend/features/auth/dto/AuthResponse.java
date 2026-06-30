package com.example.backend.features.auth.dto;

public record AuthResponse(
    String accessToken,
    String refreshToken) {
}
