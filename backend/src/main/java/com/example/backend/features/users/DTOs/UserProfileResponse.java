package com.example.backend.features.users.DTOs;

import com.example.backend.features.users.Role;

public record UserProfileResponse(
    Long id,
    String userName,
    String email,
    Role role) {
}
