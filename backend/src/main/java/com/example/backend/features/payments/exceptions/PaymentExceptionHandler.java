package com.example.backend.features.payments.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.backend.shared.exceptions.BaseExceptionHandler;
import com.example.backend.shared.exceptions.ErrorResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class PaymentExceptionHandler extends BaseExceptionHandler {
  @ExceptionHandler(PaymentProcessingException.class)
  public ResponseEntity<ErrorResponse> handlePaymentProcessing(PaymentProcessingException ex) {
    log.warn("Payment not found: {}", ex.getMessage());
    return buildError(HttpStatus.BAD_GATEWAY, "PAYMENT_PROCESSING_ERROR");
  }

}
