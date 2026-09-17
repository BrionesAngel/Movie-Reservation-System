package com.example.backend.features.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.features.auth.exceptions.InvalidRefreshTokenException;
import com.example.backend.features.auth.security.RefreshToken;
import com.example.backend.features.auth.security.RefreshTokenRepository;
import com.example.backend.features.users.User;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.security.SecureRandom;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

  private final RefreshTokenRepository refreshTokenRepository;

  public String generateAndSaveRefreshToken(User user) {
    String token = generateSecureToken();
    String tokenHash = BCrypt.hashpw(token, BCrypt.gensalt());

    RefreshToken refreshToken = RefreshToken.builder()
        .user(user)
        .tokenHash(tokenHash)
        .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS))
        .isRevoked(false)
        .createdAt(Instant.now())
        .build();

    refreshTokenRepository.save(refreshToken);
    return token;
  }

  @Transactional
  public User validateAndGetUser(String tokenValue) {
    RefreshToken refreshToken = refreshTokenRepository.findAll().stream()
        .filter(rt -> !rt.isRevoked())
        .filter(rt -> rt.getExpiresAt().isAfter(Instant.now()))
        .filter(rt -> BCrypt.checkpw(tokenValue, rt.getTokenHash()))
        .findFirst()
        .orElseThrow(() -> new InvalidRefreshTokenException("Invalid refresh token"));

    return refreshToken.getUser();
  }

  @Transactional
  public void revokeAllTokensForUser(Long userId) {
    refreshTokenRepository.revokeAllByUserId(userId);
  }

  private String generateSecureToken() {
    byte[] randomBytes = new byte[32];
    new SecureRandom().nextBytes(randomBytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
  }

  @Transactional
  public void revokeToken(String refreshTokenValue) {
    RefreshToken refreshToken = refreshTokenRepository
        .findAll()
        .stream()
        .filter(rt -> !rt.isRevoked())
        .filter(rt -> rt.getExpiresAt().isAfter(Instant.now()))
        .filter(rt -> BCrypt.checkpw(refreshTokenValue, rt.getTokenHash()))
        .findFirst()
        .orElseThrow(() -> new InvalidRefreshTokenException("Invalid refresh token"));

    refreshToken.setRevoked(true);
  }
}
