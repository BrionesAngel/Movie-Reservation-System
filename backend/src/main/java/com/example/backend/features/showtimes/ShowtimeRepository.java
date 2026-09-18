package com.example.backend.features.showtimes;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
  @Query("""
    SELECT COUNT(s) > 0
    FROM Showtime s
    WHERE s.room.id = :roomId
    AND s.startTime < :endTime
    AND s.endTime > :startTime
  """)
  boolean existsOverlapping(Long roomId, Instant startTime, Instant endTime);
  @EntityGraph(attributePaths = "movie")
  List<Showtime> findByStartTimeBetween(Instant rangeStart, Instant rangeEnd);

  @EntityGraph(attributePaths = "movie")
  List<Showtime> findByMovieIdAndStartTimeBetween(Long movieId, Instant rangeStart, Instant rangeEnd);

  @EntityGraph(attributePaths = "movie")
  List<Showtime> findByStartTimeAfterOrderByStartTimeAsc(Instant startTime);

  boolean existsByMovieId(Long movieId);

  @Query("""
    SELECT DISTINCT s.movie.id
    FROM Showtime s
    WHERE s.startTime > :startTime
  """)
  List<Long> findDistinctMovieIdsByStartTimeAfter(Instant startTime);
}
