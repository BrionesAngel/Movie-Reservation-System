package com.example.backend.features.reservations;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.features.auth.security.CustomUserDetails;
import com.example.backend.features.reservations.DTOs.ReservationRequest;
import com.example.backend.features.reservations.DTOs.ReservationResponse;

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
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @Valid @RequestBody ReservationRequest request) {
    return reservationService.createReservation(userDetails.getUser(), request);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping
  @ResponseStatus(HttpStatus.OK)
  public List<ReservationResponse> getAllReservations(@RequestParam LocalDate date) {
    return reservationService.getAllReservationsByDate(date);
  }

}
