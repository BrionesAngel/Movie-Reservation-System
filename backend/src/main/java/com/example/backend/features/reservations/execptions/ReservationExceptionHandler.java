package com.example.backend.features.reservations.execptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.backend.shared.exceptions.BaseExceptionHandler;
import com.example.backend.shared.exceptions.ErrorResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class ReservationExceptionHandler extends BaseExceptionHandler {

  @ExceptionHandler(ReservationExpiredException.class)
  public ResponseEntity<ErrorResponse> handleReservationExpired(ReservationExpiredException ex) {
    log.warn("Payment window time ended: {}", ex.getMessage());
    return buildError(HttpStatus.CONFLICT, "RESERVATION_EXPIRED");

  }

}
