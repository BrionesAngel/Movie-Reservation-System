package com.example.backend.features.reservations;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.features.auth.security.CustomUserPrincipal;
import com.example.backend.features.payments.DTOs.CreatePaymentResponse;
import com.example.backend.features.reservations.DTOs.ReservationPaymentResponse;
import com.example.backend.features.reservations.DTOs.ReservationRequest;
import com.example.backend.features.reservations.DTOs.ReservationResponse;
import com.example.backend.features.reservations.DTOs.ReservationSummaryResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reservations")
public class ReservationController {

  private final ReservationService reservationService;

  @PostMapping("/create")
  @ResponseStatus(HttpStatus.OK)
  public ReservationResponse createReservation(
      @AuthenticationPrincipal CustomUserPrincipal customUserPrincipal,
      @Valid @RequestBody ReservationRequest request) {
    return reservationService.createReservation(customUserPrincipal.getUserId(), request);
  }

  @GetMapping("/{reservationId}/payment")
  @ResponseStatus(HttpStatus.OK)
  public ReservationPaymentResponse getReservationPayment(
      @AuthenticationPrincipal CustomUserPrincipal customUserPrincipal,
      @PathVariable Long reservationId) {
    return reservationService.getReservationPaymentDetails(customUserPrincipal.getUserId(), reservationId);
  }

  @GetMapping("/{reservationId}/payment-intent")
  @ResponseStatus(HttpStatus.OK)
  public CreatePaymentResponse getReservationPaymentIntent(
      @AuthenticationPrincipal CustomUserPrincipal customUserPrincipal,
      @PathVariable Long reservationId) {
    return reservationService.getReservationPaymentIntent(customUserPrincipal.getUserId(), reservationId);
  }

  @PatchMapping("/{reservationId}/cancel")
  public void cancelReservation(
      @AuthenticationPrincipal CustomUserPrincipal customUserPrincipal,
      @PathVariable Long reservationId) {
    reservationService.cancelReservation(customUserPrincipal.getUserId(), reservationId);
  }

  @GetMapping("/mine")
  @ResponseStatus(HttpStatus.OK)
  public List<ReservationSummaryResponse> getMyReservations(
      @AuthenticationPrincipal CustomUserPrincipal customUserPrincipal) {
    return reservationService.getMyReservations(customUserPrincipal.getUserId());
  }

  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping
  @ResponseStatus(HttpStatus.OK)
  public List<ReservationSummaryResponse> getAllReservations(@RequestParam LocalDate date) {
    return reservationService.getAllReservationsByDate(date);
  }

}
