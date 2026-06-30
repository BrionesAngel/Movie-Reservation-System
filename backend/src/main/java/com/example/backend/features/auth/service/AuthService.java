package com.example.backend.features.auth.service;

import lombok.RequiredArgsConstructor;
import com.example.backend.features.users.User;
import com.example.backend.features.users.UserService;
import com.example.backend.features.users.UserRepository;
import com.example.backend.features.auth.security.JwtService;
import com.example.backend.shared.exceptions.ResourceNotFoundException;
import com.example.backend.features.auth.dto.AuthResponse;
import com.example.backend.features.auth.dto.RegisterRequest;
import com.example.backend.features.auth.dto.LoginRequest;
import com.example.backend.features.auth.dto.RefreshTokenRequest;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final AuthenticationManager authenticationManager;
  private final JwtService jwtService;
  private final UserService userService;
  private final RefreshTokenService refreshTokenService;
  private final UserRepository userRepository;

  public AuthResponse login(LoginRequest request) {
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
            request.email(),
            request.password()));

    User user = userRepository.findByEmail(request.email())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    String accessToken = jwtService.generateAccessToken(user.getEmail());
    String refreshToken = refreshTokenService.generateAndSaveRefreshToken(user.getId());

    return new AuthResponse(accessToken, refreshToken);
  }

  public AuthResponse register(RegisterRequest request) {
    User user = userService.createUser(request);

    String accessToken = jwtService.generateAccessToken(user.getEmail());
    String refreshToken = refreshTokenService.generateAndSaveRefreshToken(user.getId());

    return new AuthResponse(accessToken, refreshToken);
  }

  public void logout(String username, String refreshToken) {
    refreshTokenService.revokeToken(username, refreshToken);
  }

  public AuthResponse refresh(RefreshTokenRequest request) {
    User user = refreshTokenService.validateAndGetUser(request.refreshToken());
    String newAccessToken = jwtService.generateAccessToken(user.getEmail());

    return new AuthResponse(newAccessToken, request.refreshToken());
  }
}
