package com.example.backend.features.users.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUsernameRequest(
    @NotBlank(message = "username required")
    @Size(min = 2, max = 20, message = "username length invalid")
    String username) {
}
