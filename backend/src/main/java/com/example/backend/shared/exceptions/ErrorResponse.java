package com.example.backend.shared.exceptions;

import java.time.LocalDateTime;
import java.util.Map;

public record ErrorResponse(
    String message,
    int status,
    Map<String, String> errors,
    LocalDateTime timestamp) {

  public ErrorResponse(String message, int status, LocalDateTime timestamp) {
    this(message, status, null, timestamp);
  }
}
