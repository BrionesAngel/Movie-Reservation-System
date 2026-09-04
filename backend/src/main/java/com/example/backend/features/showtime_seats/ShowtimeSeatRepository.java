package com.example.backend.features.showtime_seats;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ShowtimeSeatRepository extends JpaRepository<ShowtimeSeat, Long> {
  @Query("""
          SELECT ss
          FROM ShowtimeSeat ss
          JOIN FETCH ss.seat
          WHERE ss.showtime.id = :showtimeId
      """)
  List<ShowtimeSeat> findAllByShowtimeId(Long showtimeId);

  List<ShowtimeSeat> findAllByShowtimeIdAndIdIn(Long showtimeId, List<Long> ids);
}
