package com.example.backend.features.reservations.execptions;

public class ReservationNotCancellableException extends RuntimeException {
  public ReservationNotCancellableException(String message) {
    super(message);
  }

}