package com.example.backend.features.auth.security;

import org.springframework.stereotype.Service;

import com.example.backend.features.users.Role;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

  @Value("${jwt.secret}")
  private String secretBase64;

  private SecretKey getSigningKey() {
    byte[] keyBytes = Decoders.BASE64.decode(secretBase64);
    return Keys.hmacShaKeyFor(keyBytes);
  }

  public String generateAccessToken(Long userId, Role userRole) {
    // long jwtExpirationMs = 1000 * 60 * 15;
    long jwtExpirationMs = 1000 * 15;

    return Jwts.builder()
        .subject(userId.toString())
        .claim("role", userRole)
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
        .signWith(getSigningKey())
        .compact();
  }

  public String extractUserId(String token) {
    return extractAllClaims(token).getSubject();
  }

  public boolean isTokenValid(String token) {
    return !isTokenExpired(token);
  }

  private boolean isTokenExpired(String token) {
    return extractExpiration(token).before(new Date());
  }

  private Date extractExpiration(String token) {
    return extractAllClaims(token).getExpiration();
  }

  private Claims extractAllClaims(String token) {
    return Jwts.parser()
        .verifyWith(getSigningKey())
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }

  public String extractUserRole(String token) {
    return extractAllClaims(token).get("role", String.class);
  }
}
