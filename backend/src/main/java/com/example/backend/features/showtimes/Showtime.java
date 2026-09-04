package com.example.backend.features.showtimes;

import java.math.BigDecimal;
import java.time.Instant;

import com.example.backend.features.movies.Movie;
import com.example.backend.features.rooms.Room;

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

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "room_id", nullable = false)
  private Room room;

  @Column(nullable = false)
  private Instant startTime;

  private Instant endTime;

  @Column(nullable = false)
  private BigDecimal price;
}
