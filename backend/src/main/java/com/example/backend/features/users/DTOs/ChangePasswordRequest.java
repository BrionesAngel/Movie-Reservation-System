package com.example.backend.features.users.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ChangePasswordRequest(
    @NotBlank(message = "currentPassword required")
    String currentPassword,

    @NotBlank(message = "newPassword required")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$", message = "Min 6 chars, 1 mayus, 1 minus, 1 number, 1 special char")
    String newPassword,

    @NotBlank(message = "confirmNewPassword required")
    String confirmNewPassword) {
}
