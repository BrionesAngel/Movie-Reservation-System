package com.example.backend.features.showtimes.DTOs;

import com.example.backend.features.movies.Movie;

public record ShowtimeMovieResponse(
  Long id,
  String title,
  String posterUrl,
  Short duration_minutes
) {
  public static ShowtimeMovieResponse from(Movie movie) {
    return new ShowtimeMovieResponse(
        movie.getId(),
        movie.getTitle(),
        movie.getPosterUrl(),
        movie.getDurationMinutes());
  }
}
