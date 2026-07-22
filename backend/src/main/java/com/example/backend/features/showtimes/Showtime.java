package com.example.backend.features.showtimes;

import java.time.LocalDateTime;

import com.example.backend.features.movies.Movie;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "showtimes")
public class Showtime {
 
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "movie_id", nullable = false)
  private Movie movie;

  private LocalDateTime date;
}
