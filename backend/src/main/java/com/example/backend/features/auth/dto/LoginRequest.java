package com.example.backend.features.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "email required") @Email String email,

    @NotBlank(message = "password required") String password) {
}
