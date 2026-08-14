package com.example.backend.features.showtime_seats;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ShowtimeSeatRepository extends JpaRepository<ShowtimeSeat, Long>{
  List<ShowtimeSeat> findAllByShowtimeId(Long showtimeId);
}
