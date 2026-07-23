package com.example.backend.features.movies;

import java.util.List;
import java.util.ArrayList;

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
  private Short duration_minutes;

  @Column(length = 255, nullable = false)
  private String posterUrl;
 
  @Builder.Default
  @ManyToMany
  @JoinTable(
    name = "movie_genres",
    joinColumns = @JoinColumn(name = "movie_id"),
    inverseJoinColumns = @JoinColumn(name = "genre_id")
  )
  private List<Genre> genres = new ArrayList<>();
}
