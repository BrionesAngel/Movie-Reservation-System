package com.example.backend.features.users.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

import com.example.backend.shared.exceptions.BaseExceptionHandler;
import com.example.backend.shared.exceptions.ErrorResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice
public class UsersExceptionHandler extends BaseExceptionHandler {

  @ExceptionHandler(UsernameAlreadyExistsException.class)
  public ResponseEntity<ErrorResponse> handleUsernameAlreadyExists(UsernameAlreadyExistsException ex) {
    log.warn("Username already exists: {}", ex.getMessage());
    return buildError(HttpStatus.CONFLICT, "USERNAME_ALREADY_EXISTS");
  }

  @ExceptionHandler(InvalidCurrentPasswordException.class)
  public ResponseEntity<ErrorResponse> handleInvalidCurrentPassword(InvalidCurrentPasswordException ex) {
    log.warn("Invalid current password: {}", ex.getMessage());
    return buildError(HttpStatus.BAD_REQUEST, "INVALID_CURRENT_PASSWORD");
  }

  @ExceptionHandler(PasswordMismatchException.class)
  public ResponseEntity<ErrorResponse> handlePasswordMismatch(PasswordMismatchException ex) {
    log.warn("Password mismatch: {}", ex.getMessage());
    return buildError(HttpStatus.BAD_REQUEST, "PASSWORD_MISMATCH");
  }
}
