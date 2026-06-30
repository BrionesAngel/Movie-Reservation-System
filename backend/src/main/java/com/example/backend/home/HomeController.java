package com.example.backend.home;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

@RestController
@RequestMapping("/api")
public class HomeController {

  @GetMapping("/test")
  public String test(@AuthenticationPrincipal UserDetails userDetails) {
    return "Hello " + userDetails.getUsername() + "! Time: " + System.currentTimeMillis();
  }
}
