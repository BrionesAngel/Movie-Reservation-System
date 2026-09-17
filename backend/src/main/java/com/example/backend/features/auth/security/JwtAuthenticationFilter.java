package com.example.backend.features.auth.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.backend.features.auth.service.JwtService;
import com.example.backend.features.users.Role;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtService jwtService;

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {

    final String authHeader = request.getHeader("Authorization");

    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      filterChain.doFilter(request, response);
      return;
    }

    final String token = authHeader.substring("Bearer ".length());
    if (token.isBlank()) {
      filterChain.doFilter(request, response);
      return;
    }

    try {
      final Claims claims = jwtService.extractAllClaims(token);

      if (SecurityContextHolder.getContext().getAuthentication() == null) {
        final String userId = jwtService.extractUserId(claims);
        final String userRole = jwtService.extractUserRole(claims);
        CustomUserPrincipal principal = CustomUserPrincipal.builder()
            .userId(Long.valueOf(userId))
            .userRole(Role.valueOf(userRole))
            .build();

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            principal, null, principal.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authentication);
      }

      filterChain.doFilter(request, response);
    } catch (ExpiredJwtException e) {
      log.warn(e.getMessage());
      sendError(response, "TOKEN_EXPIRED");
    } catch (SignatureException | MalformedJwtException e) {
      log.warn(e.getMessage());
      sendError(response, "INVALID_TOKEN");
    } catch (JwtException | IllegalArgumentException e) {
      log.warn(e.getMessage());
      sendError(response, "INVALID_TOKEN");
    } catch (Exception e) {
      log.error(e.toString());
      sendError(response, "AUTH_ERROR");
    }

  }

  private void sendError(HttpServletResponse response, String code) throws IOException {
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    response.setContentType("application/json");
    response.getWriter().write("{\"error\": \"%s\"}".formatted(code));
  }
}
