package com.example.backend.features.showtime_seats.exceptions;

public class ShowtimeSeatNotAvailableException extends RuntimeException {
  public ShowtimeSeatNotAvailableException(String message) {
    super(message);
  }
}
