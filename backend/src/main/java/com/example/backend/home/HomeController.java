package com.example.backend.home;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.features.auth.security.CustomUserPrincipal;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HomeController {

  @GetMapping("/health")
  public Map<String, String> health() {
    return Map.of("status", "UP");
  }

  @GetMapping("/test")
  public String test(@AuthenticationPrincipal CustomUserPrincipal customUserPrincipal) {
    return "Hello user: " + customUserPrincipal.getUserId() + " Time: :" + LocalDateTime.now();
  }
}
