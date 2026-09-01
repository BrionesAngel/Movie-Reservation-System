package com.example.backend.features.users.DTOs;

import com.example.backend.features.users.Role;

public record UserResponse(
    Long id,
    String username,
    String email,
    Role role) {
}