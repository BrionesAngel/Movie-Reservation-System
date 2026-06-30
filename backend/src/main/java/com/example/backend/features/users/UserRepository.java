package com.example.backend.features.users;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
  boolean existsByEmail(String email);
  boolean existsByUsername(String username);

  Optional<User> findByUsername(String username);
  Optional<User> findByEmail(String email);
}
