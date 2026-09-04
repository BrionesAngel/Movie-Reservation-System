package com.example.backend.features.showtimes;

import java.time.Instant;
import java.util.List;

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
  List<Showtime> findByStartTimeBetween(Instant rangeStart, Instant rangeEnd);
  List<Showtime> findByStartTimeAfterOrderByStartTimeAsc(Instant startTime);
  boolean existsByMovieId(Long movieId);
}
