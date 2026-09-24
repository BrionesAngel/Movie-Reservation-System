package com.example.backend.features.reservations;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
  @Query("""
        SELECT DISTINCT r FROM Reservation r
        LEFT JOIN FETCH r.seats
        LEFT JOIN FETCH r.showtime
        LEFT JOIN FETCH r.showtime.movie
        LEFT JOIN FETCH r.showtime.room
        WHERE r.createdAt BETWEEN :start AND :end
        ORDER BY r.createdAt DESC
      """)
  List<Reservation> findAllByCreatedAtBetweenWithSeats(Instant start, Instant end);

  @Query("""
        SELECT DISTINCT r FROM Reservation r
        LEFT JOIN FETCH r.seats
        LEFT JOIN FETCH r.showtime
        LEFT JOIN FETCH r.showtime.movie
        LEFT JOIN FETCH r.showtime.room
        WHERE r.user.id = :userId
        ORDER BY r.createdAt DESC
        LIMIT 10
      """)
  List<Reservation> findAllByUserIdWithSeats(Long userId);

  @Query("""
        SELECT r FROM Reservation r
        LEFT JOIN FETCH r.seats
        WHERE r.id = :reservationId
      """)
  Optional<Reservation> findByIdWithSeats(Long reservationId);

  @Query("""
          SELECT r FROM Reservation r
          LEFT JOIN FETCH r.seats
          WHERE r.status = :status AND r.reserveUntil < :time
      """)
  List<Reservation> findAllByStatusAndReserveUntilBeforeWithSeats(ReservationStatus status, Instant time);

  @Query("""
      SELECT r FROM Reservation r
      LEFT JOIN FETCH r.seats
      WHERE r.id = :reservationId
      AND r.user.id = :userId
      """)
  Optional<Reservation> getReservationWithSeatsByIdAndUserId(Long reservationId, Long userId);
}
