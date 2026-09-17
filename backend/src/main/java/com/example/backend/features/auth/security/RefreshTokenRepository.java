package com.example.backend.features.auth.security;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
  Optional<RefreshToken> findByTokenHashAndIsRevokedFalse(String tokenHash);

  @Modifying
  @Query("UPDATE RefreshToken SET isRevoked = true WHERE user.id = :userId")
  void revokeAllByUserId(@Param("userId") Long userId);

  @Modifying
  @Query("DELETE FROM RefreshToken rt WHERE rt.isRevoked = true OR rt.expiresAt < :now")
  int deleteRevokedOrExpired(@Param("now") Instant now);

  List<RefreshToken> findAll();
}
