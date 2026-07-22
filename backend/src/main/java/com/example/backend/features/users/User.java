package com.example.backend.features.users;

import java.util.ArrayList;
import java.util.List;

import com.example.backend.features.auth.security.RefreshToken;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = { "username" }),
    @UniqueConstraint(columnNames = { "email" })
})
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String username;

  @Column(nullable = false)
  private String password;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false, length = 50)
  @Enumerated(EnumType.STRING)
  private Role role;

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<RefreshToken> refreshTokens = new ArrayList<>();
}
