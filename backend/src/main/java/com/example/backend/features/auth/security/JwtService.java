package com.example.backend.features.auth.security;

import org.springframework.stereotype.Service;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
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

  public String generateAccessToken(String subject) {
    long jwtExpirationMs = 1000 * 60 * 15;

    return Jwts.builder()
        .subject(subject)
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
        .signWith(getSigningKey())
        .compact();
  }

  public String extractUsername(String token) {
    return extractAllClaims(token).getSubject();
  }

  public boolean isTokenValid(String token, UserDetails user) {
    try {
      final String username = extractUsername(token);
      return username.equals(user.getUsername()) && !isTokenExpired(token);
    } catch (Exception e) {
      return false;
    }
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
}
