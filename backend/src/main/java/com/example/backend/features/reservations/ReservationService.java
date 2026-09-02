package com.example.backend.features.reservations;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.features.payments.PaymentService;
import com.example.backend.features.payments.DTOs.CreatePaymentResponse;
import com.example.backend.features.reservations.DTOs.ReservationRequest;
import com.example.backend.features.reservations.DTOs.ReservationResponse;
import com.example.backend.features.reservations.DTOs.ReservationSummaryResponse;
import com.example.backend.features.reservations.execptions.ReservationExpiredException;
import com.example.backend.features.reservations.execptions.ReservationNotCancellableException;
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
  private final PaymentService paymentService;

  @Transactional
  public void cancelReservation(Long userId, Long reservationId) {
    Reservation reservation = reservationRepository.getReservationWithSeatsByIdAndUserId(reservationId, userId)
        .orElseThrow(
            () -> new ResourceNotFoundException("reservation: " + reservationId + " of user: " + userId + "not found"));

    if (!reservation.getShowtime().getStartTime().isAfter(LocalDateTime.now())) {
      throw new ReservationNotCancellableException(
          "reservation for showtime: " + reservation.getShowtime().getId() + " has already started");
    }

    reservation.setStatus(ReservationStatus.CANCELED);
    showtimeSeatService.markSeatsAsAvailable(reservation.getSeats());
  }

  @Transactional
  public void markReservationAsCanceledIfExpired(Long reservationId) {
    this.getReservationAndMarkCanceledIfExpired(reservationId);
  }

  @Transactional
  public void markReservationAsCanceled(Long reservationId) {
    Reservation reservation = this.getReservationByIdWithSeatsOrThrow(reservationId);
    reservation.setStatus(ReservationStatus.CANCELED);
    showtimeSeatService.markSeatsAsAvailable(reservation.getSeats());
  }

  @Transactional
  public void markReservationAsBooked(Long reservationId) {
    Reservation reservation = this.getReservationAndMarkCanceledIfExpired(reservationId);
    reservation.setStatus(ReservationStatus.BOOKED);
    showtimeSeatService.markSeatsAsBooked(reservation.getSeats());
  }

  @Transactional
  public Reservation getReservationAndMarkCanceledIfExpired(Long reservationId) {
    Reservation reservation = this.getReservationByIdWithSeatsOrThrow(reservationId);

    if (LocalDateTime.now().isAfter(reservation.getReserveUntil())) {
      reservation.setStatus(ReservationStatus.CANCELED);
      showtimeSeatService.markSeatsAsAvailable(reservation.getSeats());
      throw new ReservationExpiredException("" + reservation.getId());
    }

    return reservation;
  }

  public List<ReservationSummaryResponse> getMyReservations(User user) {
    return reservationRepository.findAllByUserIdWithSeats(user.getId())
        .stream()
        .map(r -> this.toReservationSummaryResponse(r, r.getSeats()))
        .toList();
  }

  public ReservationResponse getReservationPaymentDetails(Long userId, Long reservationId) {
    Reservation reservation = reservationRepository.getReservationWithSeatsByIdAndUserId(reservationId, userId)
        .orElseThrow(
            () -> new ResourceNotFoundException("reservation: " + reservationId + " of user: " + userId + "not found"));

    String clientSecret = paymentService.getClientSecretByReservationId(reservationId);

    return this.toReservationResponse(reservation, clientSecret, reservation.getSeats());
  }

  public List<ReservationSummaryResponse> getAllReservationsByDate(LocalDate date) {
    LocalDateTime startOfDay = date.atStartOfDay();
    LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
    return reservationRepository.findAllByCreatedAtBetweenWithSeats(startOfDay, endOfDay)
        .stream()
        .map(r -> this.toReservationSummaryResponse(r, r.getSeats()))
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

    long amountInCents = savedReservation.getTotalPrice().multiply(BigDecimal.valueOf(100)).longValueExact();

    CreatePaymentResponse createPaymentResponse = paymentService.createPayment(amountInCents, savedReservation);

    return this.toReservationResponse(savedReservation, createPaymentResponse.clientSecret(), seats);
  }

  public ReservationResponse toReservationResponse(Reservation reservation, String clientSecret,
      List<ShowtimeSeat> seats) {
    return new ReservationResponse(
        reservation.getId(),
        clientSecret,
        reservation.getUser().getId(),
        showtimeSeatService.toShowtimeSeatSummary(seats),
        reservation.getStatus(),
        reservation.getCreatedAt(),
        reservation.getReserveUntil(),
        reservation.getTotalPrice());

  }

  public ReservationSummaryResponse toReservationSummaryResponse(Reservation reservation, List<ShowtimeSeat> seats) {
    return new ReservationSummaryResponse(
        reservation.getId(),
        reservation.getShowtime().getId(),
        reservation.getUser().getId(),
        showtimeSeatService.toShowtimeSeatSummary(seats),
        reservation.getStatus(),
        reservation.getCreatedAt(),
        reservation.getReserveUntil(),
        reservation.getTotalPrice());

  }

  public Reservation getReservationByIdWithSeatsOrThrow(Long reservationId) {
    return reservationRepository.findByIdWithSeats(reservationId)
        .orElseThrow(() -> new ResourceNotFoundException("reservation not found: " + reservationId));

  }

}
