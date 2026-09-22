package com.example.backend.core.websocket;

import java.util.List;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import com.example.backend.features.auth.exceptions.InvalidRefreshTokenException;
import com.example.backend.features.auth.service.JwtService;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class WebSocketJwtInterceptor implements ChannelInterceptor {
  private final JwtService jwtService;

  @Override
  public Message<?> preSend(Message<?> message, MessageChannel channel) {
    StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

    if (StompCommand.CONNECT.equals(accessor.getCommand())) {
      String authHeader = accessor.getFirstNativeHeader("Authorization");
      if (authHeader != null && authHeader.startsWith("Bearer ")) {
        String token = authHeader.substring(7);
        Claims claims = jwtService.extractAllClaims(token);

        try {
          Long userId = Long.valueOf(jwtService.extractUserId(claims));
          String role = String.valueOf(jwtService.extractUserRole(claims));

          UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
              userId,
              null,
              List.of(new SimpleGrantedAuthority(role)));

          accessor.setUser(authentication);
          return message;
        } catch (Exception e) {
          throw new InvalidRefreshTokenException("invalid token: " + e.toString());
        }

      }
      throw new IllegalArgumentException("header is missing");

    }
    return message;
  }
}
