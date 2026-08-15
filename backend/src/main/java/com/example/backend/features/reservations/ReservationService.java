package com.example.backend.features.reservations;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.features.reservations.DTOs.ReservationRequest;
import com.example.backend.features.reservations.DTOs.ReservationResponse;
import com.example.backend.features.showtime_seats.ShowtimeSeat;
import com.example.backend.features.showtime_seats.ShowtimeSeatRepository;
import com.example.backend.features.showtime_seats.ShowtimeSeatService;
import com.example.backend.features.showtime_seats.ShowtimeSeatStatus;
import com.example.backend.features.showtime_seats.exceptions.ShowtimeSeatNotAvailableException;
import com.example.backend.features.showtimes.Showtime;
import com.example.backend.features.showtimes.ShowtimeRepository;
import com.example.backend.features.users.User;
import com.example.backend.shared.exceptions.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReservationService {

  private final ReservationRepository reservationRepository;
  private final ShowtimeRepository showtimeRepository;
  private final ShowtimeSeatRepository showtimeSeatRepository;
  private final ShowtimeSeatService showtimeSeatService;

  public List<ReservationResponse> getAllReservationsByDate(LocalDate date) {
    LocalDateTime startOfDay = date.atStartOfDay();
    LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
    return reservationRepository.findAllByCreatedAtBetweenWithSeats(startOfDay, endOfDay)
        .stream()
        .map(r -> this.toReservationResponse(r, r.getSeats()))
        .toList();
  }

  @Transactional
  public ReservationResponse createReservation(User user, ReservationRequest request) {
    Showtime showtime = showtimeRepository.findById(request.showtimeId())
        .orElseThrow(() -> new ResourceNotFoundException("showtime: " + request.showtimeId() + " not found"));

    List<ShowtimeSeat> seats = showtimeSeatRepository.findAllByShowtimeIdAndIdIn(request.showtimeId(),
        request.seatsId());
    if (seats.isEmpty())
      throw new ResourceNotFoundException("no seats found with ids: " + request.seatsId());

    if (request.seatsId().size() != seats.size())
      throw new ResourceNotFoundException("one or more seats couldnt be found");

    List<ShowtimeSeat> notAvailableSeats = seats.stream()
        .filter(s -> s.getStatus() != ShowtimeSeatStatus.AVAILABLE)
        .toList();

    if (!notAvailableSeats.isEmpty())
      throw new ShowtimeSeatNotAvailableException("" + notAvailableSeats);

    LocalDateTime now = LocalDateTime.now();

    Reservation reservation = Reservation.builder()
        .user(user)
        .showtime(showtime)
        .status(ReservationStatus.RESERVED)
        .createdAt(now)
        .reserveUntil(now.plusMinutes(5))
        .totalPrice(showtime.getPrice().multiply(BigDecimal.valueOf(seats.size())))
        .build();

    Reservation savedReservation = reservationRepository.save(reservation);

    seats.forEach(s -> {
      s.setStatus(ShowtimeSeatStatus.RESERVED);
      s.setReservation(savedReservation);
    });

    return this.toReservationResponse(savedReservation, seats);
  }

  public ReservationResponse toReservationResponse(Reservation reservation, List<ShowtimeSeat> seats) {
    return new ReservationResponse(
        reservation.getId(),
        reservation.getUser().getId(),
        showtimeSeatService.toShowtimeSeatSummary(seats),
        reservation.getStatus(),
        reservation.getCreatedAt(),
        reservation.getReserveUntil(),
        reservation.getTotalPrice());
  }
}
