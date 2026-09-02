package com.example.backend.features.movies.exceptions;

public class MovieHasShowtimesException extends RuntimeException {
  public MovieHasShowtimesException(String message) {
    super(message);
  }
}