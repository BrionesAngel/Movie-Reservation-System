package com.example.backend.features.auth.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.backend.features.users.Role;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
@RequiredArgsConstructor
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

    try {
      final String token = authHeader.substring("Bearer ".length());

      if (jwtService.isTokenValid(token) && SecurityContextHolder.getContext().getAuthentication() == null) {
        final String userId = jwtService.extractUserId(token);
        final String userRole = jwtService.extractUserRole(token);
        CustomUserPrincipal principal = CustomUserPrincipal.builder()
            .userId(Long.valueOf(userId))
            .userRole(Role.valueOf(userRole))
            .build();

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            principal, null, principal.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authentication);
      }
    } catch (Exception e) {
      logger.error("JWT authentication failed: " + e.getMessage());
    }

    filterChain.doFilter(request, response);
  }
}
