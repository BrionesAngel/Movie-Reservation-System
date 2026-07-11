package com.example.backend.features.movies;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "movies")
public class Movie {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(length = 150, nullable = false)
  private String title;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String description;

  @Column(nullable = false)
  private Integer duration;

  @Column(length = 255, nullable = false)
  private String posterUrl;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Genre genre;
}
