package com.example.backend.features.showtime_seats;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.features.seats.Seat;
import com.example.backend.features.seats.SeatRepository;
import com.example.backend.features.seats.SeatStatus;
import com.example.backend.features.showtime_seats.DTOs.ShowtimeSeatSummary;
import com.example.backend.features.showtimes.Showtime;
import com.example.backend.shared.exceptions.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShowtimeSeatService {
  private final ShowtimeSeatRepository showtimeSeatRepository;
  private final SeatRepository seatRepository;

  public void markSeatsAsAvailable(List<ShowtimeSeat> seats) {
    seats.forEach(s -> {
      s.setStatus(ShowtimeSeatStatus.AVAILABLE);
      s.setReservation(null);
    });
  }

  public void markSeatsAsBooked(List<ShowtimeSeat> seats) {
    seats.forEach(s -> s.setStatus(ShowtimeSeatStatus.BOOKED));
  }

  @Transactional
  public void createSeatsforShowtime(Showtime showtime) {
    List<Seat> seats = seatRepository.findAllByRoomId(showtime.getRoom().getId());
    if (seats.isEmpty())
      throw new ResourceNotFoundException("no seats found for room " + showtime.getRoom().getId());

    List<ShowtimeSeat> showtimeSeats = seats.stream()
        .map(seat -> ShowtimeSeat.builder()
            .showtime(showtime)
            .seat(seat)
            .status(seat.getStatus() == SeatStatus.ACTIVE ? ShowtimeSeatStatus.AVAILABLE : ShowtimeSeatStatus.BLOCKED)
            .build())
        .toList();

    showtimeSeatRepository.saveAll(showtimeSeats);
  }

  public List<ShowtimeSeatSummary> toShowtimeSeatSummary(List<ShowtimeSeat> seats) {
    List<ShowtimeSeatSummary> seatsSummary = seats.stream()
        .map(s -> new ShowtimeSeatSummary(
            s.getId(),
            s.getSeat().getRow(),
            s.getSeat().getNumber(),
            s.getStatus()))
        .toList();

    return seatsSummary;
  }
}
