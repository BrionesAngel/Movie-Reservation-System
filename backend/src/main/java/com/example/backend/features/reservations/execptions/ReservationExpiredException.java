package com.example.backend.features.reservations.execptions;

public class ReservationExpiredException extends RuntimeException {
  public ReservationExpiredException(String message) {
    super(message);
  }

}
