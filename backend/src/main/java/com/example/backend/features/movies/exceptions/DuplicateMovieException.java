package com.example.backend.features.movies.exceptions;

public class DuplicateMovieException extends RuntimeException {
  public DuplicateMovieException(String message) {
    super(message);
  }
}
