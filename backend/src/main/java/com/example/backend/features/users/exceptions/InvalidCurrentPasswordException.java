package com.example.backend.features.users.exceptions;

public class InvalidCurrentPasswordException extends RuntimeException {
  public InvalidCurrentPasswordException(String message) {
    super(message);
  }
}
