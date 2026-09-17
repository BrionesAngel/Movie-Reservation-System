package com.example.backend.features.auth.service;

import java.time.Instant;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.features.auth.security.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class RefreshTokenCleanupJob {

  private final RefreshTokenRepository refreshTokenRepository;

  @Scheduled(cron = "0 0 3 * * *")
  @Transactional
  public void cleanupTokens() {
    int eliminados = refreshTokenRepository.deleteRevokedOrExpired(Instant.now());
    log.info("Limpieza de refresh tokens: {} eliminados", eliminados);
  }
}
