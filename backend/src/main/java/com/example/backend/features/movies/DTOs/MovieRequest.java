package com.example.backend.features.movies.DTOs;

import java.util.Set;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record MovieRequest(
  @NotBlank String title,
  @NotBlank String description,
  @NotNull Short duration_minutes,
  @NotBlank String posterUrl,
  @NotEmpty Set<Long> genres
) {}
