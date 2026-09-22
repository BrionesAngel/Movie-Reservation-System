package com.example.backend.features.reservations;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.features.payments.PaymentService;
import com.example.backend.features.payments.DTOs.CreatePaymentResponse;
import com.example.backend.features.reservations.DTOs.ReservationPaymentResponse;
import com.example.backend.features.reservations.DTOs.ReservationRequest;
import com.example.backend.features.reservations.DTOs.ReservationResponse;
import com.example.backend.features.reservations.DTOs.ReservationSummaryResponse;
import com.example.backend.features.reservations.events.SeatsReleasedEvent;
import com.example.backend.features.reservations.events.SeatsReservedEvent;
import com.example.backend.features.reservations.execptions.ReservationExpiredException;
import com.example.backend.features.reservations.execptions.ReservationNotCancellableException;
import com.example.backend.features.showtime_seats.ShowtimeSeat;
import com.example.backend.features.showtime_seats.ShowtimeSeatRepository;
import com.example.backend.features.showtime_seats.ShowtimeSeatService;
import com.example.backend.features.showtime_seats.ShowtimeSeatStatus;
import com.example.backend.features.showtime_seats.exceptions.ShowtimeSeatNotAvailableException;
import com.example.backend.features.showtimes.Showtime;
import com.example.backend.features.showtimes.ShowtimeRepository;
import com.example.backend.features.showtimes.DTOs.ShowtimeMovieResponse;
import com.example.backend.shared.constants.CinemaTime;
import com.example.backend.features.users.User;
import com.example.backend.features.users.UserRepository;
import com.example.backend.shared.exceptions.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReservationService {

  private final CacheManager cacheManager;
  private final ReservationRepository reservationRepository;
  private final ShowtimeRepository showtimeRepository;
  private final ShowtimeSeatRepository showtimeSeatRepository;
  private final ShowtimeSeatService showtimeSeatService;
  private final PaymentService paymentService;
  private final UserRepository userRepository;
  private final ApplicationEventPublisher eventPublisher;

  private void cancelAndReleaseSeats(Reservation reservation) {
    reservation.setStatus(ReservationStatus.CANCELED);
    showtimeSeatService.markSeatsAsAvailable(reservation.getSeats());

    eventPublisher.publishEvent(new SeatsReleasedEvent(
        reservation.getShowtime().getId(),
        reservation.getSeats().stream().map(ShowtimeSeat::getId).toList()));

    cacheManager.getCache("showtime")
        .evict(reservation.getShowtime().getId());
  }

  @Transactional
  public void cancelReservation(Long userId, Long reservationId) {
    Reservation reservation = reservationRepository.getReservationWithSeatsByIdAndUserId(reservationId, userId)
        .orElseThrow(
            () -> new ResourceNotFoundException("reservation: " + reservationId + " of user: " + userId + "not found"));

    if (!reservation.getShowtime().getStartTime().isAfter(Instant.now())) {
      throw new ReservationNotCancellableException(
          "reservation for showtime: " + reservation.getShowtime().getId() + " has already started");
    }
    this.cancelAndReleaseSeats(reservation);
    paymentService.refundPaymentIfSucceeded(reservation.getId());

    cacheManager.getCache("showtime")
        .evict(reservation.getShowtime().getId());
  }

  @Transactional
  public void markReservationAsCanceledIfExpired(Long reservationId) {
    this.getReservationAndMarkCanceledIfExpired(reservationId);
  }

  @Transactional
  public void markReservationAsCanceled(Long reservationId) {
    Reservation reservation = this.getReservationByIdWithSeatsOrThrow(reservationId);
    this.cancelAndReleaseSeats(reservation);
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

    if (Instant.now().isAfter(reservation.getReserveUntil())) {
      this.cancelAndReleaseSeats(reservation);
      throw new ReservationExpiredException("" + reservation.getId());
    }

    return reservation;
  }

  @Transactional
  public List<ReservationSummaryResponse> getMyReservations(Long userId) {
    return reservationRepository.findAllByUserIdWithSeats(userId)
        .stream()
        .map(r -> this.toReservationSummaryResponse(r, r.getSeats()))
        .toList();
  }

  @Transactional
  public ReservationPaymentResponse getReservationPaymentDetails(Long userId, Long reservationId) {
    Reservation reservation = reservationRepository.getReservationWithSeatsByIdAndUserId(reservationId, userId)
        .orElseThrow(
            () -> new ResourceNotFoundException("reservation: " + reservationId + " of user: " + userId + "not found"));

    return this.toReservationPaymentResponse(reservation, reservation.getSeats());
  }

  @Transactional
  public CreatePaymentResponse getReservationPaymentIntent(Long userId, Long reservationId) {
    Reservation reservation = reservationRepository.getReservationWithSeatsByIdAndUserId(reservationId, userId)
        .orElseThrow(
            () -> new ResourceNotFoundException("reservation: " + reservationId + " of user: " + userId + "not found"));

    return new CreatePaymentResponse(paymentService.getClientSecretByReservationId(reservation.getId()));
  }

  @Transactional
  public List<ReservationSummaryResponse> getAllReservationsByDate(LocalDate date) {
    Instant startOfDay = date.atStartOfDay(CinemaTime.ZONE).toInstant();
    Instant endOfDay = date.plusDays(1).atStartOfDay(CinemaTime.ZONE).toInstant();
    return reservationRepository.findAllByCreatedAtBetweenWithSeats(startOfDay, endOfDay)
        .stream()
        .map(r -> this.toReservationSummaryResponse(r, r.getSeats()))
        .toList();
  }

  @Transactional
  @CacheEvict(value = "showtime", key = "#request.showtimeId()")
  public ReservationResponse createReservation(Long userId, ReservationRequest request) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("user: " + userId + "not found"));

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

    Instant now = Instant.now();

    Reservation reservation = Reservation.builder()
        .user(user)
        .showtime(showtime)
        .status(ReservationStatus.RESERVED)
        .createdAt(now)
        .reserveUntil(now.plusSeconds(300))
        .totalPrice(showtime.getPrice().multiply(BigDecimal.valueOf(seats.size())))
        .build();

    Reservation savedReservation = reservationRepository.save(reservation);

    seats.forEach(s -> {
      s.setStatus(ShowtimeSeatStatus.RESERVED);
      s.setReservation(savedReservation);
    });

    eventPublisher.publishEvent(new SeatsReservedEvent(
        request.showtimeId(),
        seats.stream().map(ShowtimeSeat::getId).toList()));

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
        paymentService.getPaymentStatusByReservationId(reservation.getId()),
        reservation.getCreatedAt(),
        reservation.getReserveUntil(),
        reservation.getTotalPrice());

  }

  public ReservationPaymentResponse toReservationPaymentResponse(Reservation reservation, List<ShowtimeSeat> seats) {
    return new ReservationPaymentResponse(
        reservation.getId(),
        reservation.getUser().getId(),
        showtimeSeatService.toShowtimeSeatSummary(seats),
        reservation.getStatus(),
        paymentService.getPaymentStatusByReservationId(reservation.getId()),
        reservation.getCreatedAt(),
        reservation.getReserveUntil(),
        reservation.getTotalPrice());
  }

  public ReservationSummaryResponse toReservationSummaryResponse(Reservation reservation, List<ShowtimeSeat> seats) {
    Showtime showtime = reservation.getShowtime();
    return new ReservationSummaryResponse(
        reservation.getId(),
        showtime.getId(),
        reservation.getUser().getId(),
        showtimeSeatService.toShowtimeSeatSummary(seats),
        reservation.getStatus(),
        paymentService.getPaymentStatusByReservationId(reservation.getId()),
        reservation.getCreatedAt(),
        reservation.getReserveUntil(),
        reservation.getTotalPrice(),
        ShowtimeMovieResponse.from(showtime.getMovie()),
        showtime.getRoom().getNumber(),
        showtime.getStartTime().atZone(CinemaTime.ZONE).toLocalDateTime());
  }

  public Reservation getReservationByIdWithSeatsOrThrow(Long reservationId) {
    return reservationRepository.findByIdWithSeats(reservationId)
        .orElseThrow(() -> new ResourceNotFoundException("reservation not found: " + reservationId));

  }

}
