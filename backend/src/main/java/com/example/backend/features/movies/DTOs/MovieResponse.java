package com.example.backend.features.movies.DTOs;

import java.util.Set;

import com.example.backend.features.genres.Genre;

public record MovieResponse(
  Long id,
  String title,
  String description,
  Short duration_minutes,
  String posterUrl,
  Set<Genre> genres
) {}
