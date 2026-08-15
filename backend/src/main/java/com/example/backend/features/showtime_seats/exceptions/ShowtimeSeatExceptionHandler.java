package com.example.backend.features.showtime_seats.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.backend.shared.exceptions.BaseExceptionHandler;
import com.example.backend.shared.exceptions.ErrorResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class ShowtimeSeatExceptionHandler extends BaseExceptionHandler {

  @ExceptionHandler(ShowtimeSeatNotAvailableException.class)
  public ResponseEntity<ErrorResponse> handleShowtimeSeatNotAvailable(ShowtimeSeatNotAvailableException ex) {
    log.warn("ShowtimeSeats not available: {}", ex.getMessage());
    return buildError(HttpStatus.CONFLICT, "SHOWTIME_SEATS_NOT_AVAILABLE");
  }

  @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
  public ResponseEntity<ErrorResponse> handleOptimisticLock(ObjectOptimisticLockingFailureException ex) {
    log.warn("Optimistic lock conflict: {}", ex.getMessage());
    return buildError(HttpStatus.CONFLICT, "OPTIMISTIC_LOCK_CONFLICT");
  }
}
