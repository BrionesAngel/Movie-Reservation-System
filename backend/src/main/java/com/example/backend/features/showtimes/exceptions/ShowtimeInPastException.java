package com.example.backend.features.showtimes.exceptions;

public class ShowtimeInPastException extends RuntimeException {
  public ShowtimeInPastException(String message) {
    super(message);
  }
}
