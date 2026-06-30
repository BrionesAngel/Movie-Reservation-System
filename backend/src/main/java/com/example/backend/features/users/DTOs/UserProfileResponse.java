package com.example.backend.features.users.DTOs;

public record UserProfileResponse(
    Long id,
    String userName,
    String email) {
}
