package com.example.backend.features.auth.service;

import lombok.RequiredArgsConstructor;
import com.example.backend.features.users.User;
import com.example.backend.features.users.UserService;
import com.example.backend.features.auth.security.CustomUserDetails;
import com.example.backend.features.auth.security.JwtService;
import com.example.backend.features.auth.dto.AuthResponse;
import com.example.backend.features.auth.dto.RegisterRequest;
import com.example.backend.features.auth.dto.LoginRequest;
import com.example.backend.features.auth.dto.RefreshTokenRequest;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final AuthenticationManager authenticationManager;
  private final JwtService jwtService;
  private final UserService userService;
  private final RefreshTokenService refreshTokenService;

  public AuthResponse login(LoginRequest request) {
    Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
            request.email(),
            request.password()));

    CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

    User user = userDetails.getUser();

    String accessToken = jwtService.generateAccessToken(user.getId(), user.getRole());
    String refreshToken = refreshTokenService.generateAndSaveRefreshToken(user);

    return new AuthResponse(accessToken, refreshToken);
  }

  public AuthResponse register(RegisterRequest request) {
    User user = userService.createUser(request);

    String accessToken = jwtService.generateAccessToken(user.getId(), user.getRole());
    String refreshToken = refreshTokenService.generateAndSaveRefreshToken(user);

    return new AuthResponse(accessToken, refreshToken);
  }

  public void logout(String username, String refreshToken) {
    refreshTokenService.revokeToken(username, refreshToken);
  }

  public AuthResponse refresh(RefreshTokenRequest request) {
    User user = refreshTokenService.validateAndGetUser(request.refreshToken());
    String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getRole());

    return new AuthResponse(newAccessToken, request.refreshToken());
  }
}
