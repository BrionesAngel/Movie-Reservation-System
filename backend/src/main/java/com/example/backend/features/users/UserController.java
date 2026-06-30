package com.example.backend.features.users;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.features.auth.security.CustomUserDetails;
import com.example.backend.features.users.DTOs.ChangePasswordRequest;
import com.example.backend.features.users.DTOs.UserProfileResponse;
import com.example.backend.features.users.DTOs.UpdateUsernameRequest;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
  private final UserService userService;

  @GetMapping("/me")
  public UserProfileResponse getMyProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
    return userService.getMyProfile(userDetails.getUser());
  }

  @PatchMapping("/profile/username")
  public UserProfileResponse updateMyUsername(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @Valid @RequestBody UpdateUsernameRequest request) {
    return userService.updateMyUsername(userDetails.getUser(), request);
  }

  @PatchMapping("/profile/password")
  public void changeMyPassword(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @Valid @RequestBody ChangePasswordRequest request) {
    userService.changeMyPassword(userDetails.getUser(), request);
  }
}
