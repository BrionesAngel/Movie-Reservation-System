package com.example.backend.features.seats;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SeatRepository extends JpaRepository<Seat, Long> {
  List<Seat> findAllByRoomId(Long roomId);
}
