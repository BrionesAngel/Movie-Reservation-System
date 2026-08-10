package com.example.backend.features.showtimes;

import java.time.LocalDateTime;

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
  boolean existsOverlapping(Long roomId, LocalDateTime startTime, LocalDateTime endTime);
}
