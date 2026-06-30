package com.example.backend.features.auth.exceptions;

import org.springframework.security.authentication.InternalAuthenticationServiceException;
import javax.security.sasl.AuthenticationException;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.backend.shared.exceptions.BaseExceptionHandler;
import com.example.backend.shared.exceptions.ErrorResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class AuthExceptionHandler extends BaseExceptionHandler {

  @ExceptionHandler(DuplicateEmailException.class)
  public ResponseEntity<ErrorResponse> handleDuplicateEmail(DuplicateEmailException ex) {
    log.warn("Duplicate email: {}", ex.getMessage());
    return buildError(HttpStatus.CONFLICT, "DUPLICATE_EMAIL");
  }

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
    log.warn("Bad credentials: {}", ex.getMessage());
    return buildError(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS");
  }

  @ExceptionHandler(InternalAuthenticationServiceException.class)
  public ResponseEntity<ErrorResponse> handleInternalAuth(InternalAuthenticationServiceException ex) {
    log.warn("Auth error: {}", ex.getMessage());
    return buildError(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS");
  }

  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException ex) {
    log.warn("Authentication Exception: {}", ex.getMessage());
    return buildError(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS");
  }

  @ExceptionHandler(InvalidRefreshTokenException.class)
  public ResponseEntity<ErrorResponse> handleInvalidRefreshToken(InvalidRefreshTokenException ex) {
    log.warn("Invalid refresh token: {}", ex.getMessage());
    return buildError(HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN");
  }

  @ExceptionHandler(ExpiredJwtException.class)
  public ResponseEntity<ErrorResponse> handleExpiredJwt(ExpiredJwtException ex) {
    log.warn("JWT expired: {}", ex.getMessage());
    return buildError(HttpStatus.UNAUTHORIZED, "TOKEN_EXPIRED");
  }

  @ExceptionHandler(SignatureException.class)
  public ResponseEntity<ErrorResponse> handleSignatureException(SignatureException ex) {
    log.warn("Invalid token signature: {}", ex.getMessage());
    return buildError(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN");
  }
}
