package com.example.backend.features.movies.DTOs;

import java.util.Set;

import org.hibernate.validator.constraints.URL;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record MovieRequest(
  @NotBlank(message = "title is required")
  @Size(max=150, message = "title must not exceed 150 characters")
  String title,

  @NotBlank(message = "description is required")
  @Size(max = 3000, message = "description must not exceed 3000 characters")
  String description,

  @NotNull(message = "durationMinutes is required")
  @Positive(message = "durationMinutes must be greater than 0")
  Short durationMinutes,

  @NotBlank(message = "posterUrl is required")
  @Size(max=255, message = "posterUrl max characters 255")
  @URL(message = "posterUrl must be a valid url")
  String posterUrl,

  @NotEmpty(message = "movie must have at least one genre")
  Set<Long> genres
) {}
