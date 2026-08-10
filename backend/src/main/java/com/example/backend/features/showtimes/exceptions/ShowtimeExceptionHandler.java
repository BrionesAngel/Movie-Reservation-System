package com.example.backend.features.showtimes.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.backend.shared.exceptions.BaseExceptionHandler;
import com.example.backend.shared.exceptions.ErrorResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class ShowtimeExceptionHandler extends BaseExceptionHandler {

  @ExceptionHandler(ShowtimeConflictException.class)
  public ResponseEntity<ErrorResponse> handleUsernameAlreadyExists(ShowtimeConflictException ex) {
    log.warn("Username already exists: {}", ex.getMessage());
    return buildError(HttpStatus.CONFLICT, "a showtime is already booked at that time");
  }
}
