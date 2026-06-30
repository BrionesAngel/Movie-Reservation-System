package com.example.backend.features.auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.example.backend.features.auth.dto.AuthResponse;
import com.example.backend.features.auth.dto.RegisterRequest;
import com.example.backend.features.auth.security.CustomUserDetails;
import com.example.backend.features.auth.dto.LoginRequest;
import com.example.backend.features.auth.dto.LogoutRequest;
import com.example.backend.features.auth.dto.RefreshTokenRequest;
import com.example.backend.features.auth.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  @PostMapping("/register")
  public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
    return authService.register(request);
  }

  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest request) {
    return authService.login(request);
  }

  @PostMapping("/refresh")
  public AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
    return authService.refresh(request);
  }

  @PostMapping("/logout")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void logout(@Valid @RequestBody LogoutRequest request, @AuthenticationPrincipal CustomUserDetails userDetails){
    authService.logout(userDetails.getUsername(), request.refreshToken());
  }
}
