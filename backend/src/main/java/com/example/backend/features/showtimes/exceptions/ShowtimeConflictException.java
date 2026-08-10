package com.example.backend.features.showtimes.exceptions;

public class ShowtimeConflictException extends RuntimeException {
  public ShowtimeConflictException(String message) {
    super(message);
  }
}
