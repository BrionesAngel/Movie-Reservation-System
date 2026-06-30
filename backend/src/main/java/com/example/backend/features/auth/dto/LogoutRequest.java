package com.example.backend.features.auth.dto;

public record LogoutRequest(
    String refreshToken) {
}
