package com.example.backend.features.users;

import lombok.RequiredArgsConstructor;
import com.example.backend.features.auth.dto.RegisterRequest;
import com.example.backend.features.auth.exceptions.DuplicateEmailException;
import com.example.backend.features.users.DTOs.UserProfileResponse;
import com.example.backend.features.users.DTOs.ChangePasswordRequest;
import com.example.backend.features.users.DTOs.UpdateUsernameRequest;
import com.example.backend.features.users.exceptions.InvalidCurrentPasswordException;
import com.example.backend.features.users.exceptions.PasswordMismatchException;
import com.example.backend.features.users.exceptions.UsernameAlreadyExistsException;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public User createUser(RegisterRequest request) {
    String nextUsername = request.username().trim();

    if (userRepository.existsByEmail(request.email())) {
      throw new DuplicateEmailException("Email already exists");
    }

    if (userRepository.existsByUsername(nextUsername)) {
      throw new UsernameAlreadyExistsException("Username already exists");
    }

    User user = User.builder()
        .username(nextUsername)
        .password(passwordEncoder.encode(request.password()))
        .email(request.email())
        .build();

    return userRepository.save(user);
  }

  public UserProfileResponse getMyProfile(User user) {
    return new UserProfileResponse(user.getId(), user.getUsername(), user.getEmail());
  }

  public UserProfileResponse updateMyUsername(User user, UpdateUsernameRequest request) {
    String nextUsername = request.username().trim();
    if (!nextUsername.equals(user.getUsername()) && userRepository.existsByUsername(nextUsername)) {
      throw new UsernameAlreadyExistsException("Username already exists");
    }

    user.setUsername(nextUsername);
    userRepository.save(user);

    return new UserProfileResponse(user.getId(), user.getUsername(), user.getEmail());
  }

  public void changeMyPassword(User user, ChangePasswordRequest request) {
    if (!request.newPassword().equals(request.confirmNewPassword())) {
      throw new PasswordMismatchException("Passwords do not match");
    }

    if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
      throw new InvalidCurrentPasswordException("Current password is incorrect");
    }

    user.setPassword(passwordEncoder.encode(request.newPassword()));
    userRepository.save(user);
  }
}
