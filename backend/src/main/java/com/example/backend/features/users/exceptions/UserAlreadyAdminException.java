package com.example.backend.features.users.exceptions;

public class UserAlreadyAdminException extends RuntimeException {
  public UserAlreadyAdminException (String message) {
    super(message);
  }
}
