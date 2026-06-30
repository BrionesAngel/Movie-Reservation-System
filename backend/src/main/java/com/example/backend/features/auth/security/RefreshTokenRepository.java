package com.example.backend.features.auth.security;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.features.users.User;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
  Optional<RefreshToken> findByTokenHashAndIsRevokedFalse(String tokenHash);

  @Modifying
  @Query("UPDATE RefreshToken SET isRevoked = true WHERE user.id = :userId")
  void revokeAllByUserId(@Param("userId") Long userId);

  @Query("SELECT rt FROM RefreshToken rt WHERE rt.user = :user AND rt.isRevoked = false AND rt.expiresAt > :now")
  List<RefreshToken> findActiveTokensByUser(@Param("user") User user, @Param("now") LocalDateTime now);
}
