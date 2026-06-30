package com.example.backend.shared.exceptions;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public abstract class BaseExceptionHandler {
  protected ResponseEntity<ErrorResponse> buildError(HttpStatus status, String message) {
    return ResponseEntity.status(status)
        .body(new ErrorResponse(message, status.value(), LocalDateTime.now()));
  }
}
