package com.example.backend.features.reservations;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
  @Query("""
    SELECT r FROM Reservation r
    LEFT JOIN FETCH r.seats
    WHERE r.createdAt BETWEEN :start AND :end
  """)
    List<Reservation> findAllByCreatedAtBetweenWithSeats(LocalDateTime start, LocalDateTime end);

}
