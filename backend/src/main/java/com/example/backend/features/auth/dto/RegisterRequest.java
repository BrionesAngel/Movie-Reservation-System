package com.example.backend.features.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "username required") @Size(min = 2, max = 20) String username,
    @NotBlank(message = "email required") @Email String email,
    @NotBlank(message = "password required") @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$", message = "Min 6 chars, 1 mayus, 1 minus, 1 number, 1 special char") String password) {
}
