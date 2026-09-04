package com.example.backend.features.showtimes;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.features.showtimes.DTOs.CreateShowtimeRequest;
import com.example.backend.features.showtimes.DTOs.ShowtimeAndSeatsResponse;
import com.example.backend.features.showtimes.DTOs.ShowtimeResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/showtimes")
@RequiredArgsConstructor
public class ShowtimeController {

  private final ShowtimeService showtimeService;

  @GetMapping("/{showtimeId}")
  @ResponseStatus(HttpStatus.OK)
  public ShowtimeAndSeatsResponse getShowtimeAndSeats(@PathVariable Long showtimeId) {
    return showtimeService.getShowtimeAndShowtimeSeats(showtimeId);
  }

  @GetMapping
  @ResponseStatus(HttpStatus.OK)
  public List<ShowtimeResponse> getShowtimes(@RequestParam LocalDate date) {
    return showtimeService.getShowtimesByDate(date);
  }

  @GetMapping("/upcoming")
  @ResponseStatus(HttpStatus.OK)
  public List<ShowtimeResponse> getUpcomingShowtimes() {
    return showtimeService.getUpcomingShowtimes();
  }

  @PreAuthorize("hasRole('ADMIN')")
  @ResponseStatus(HttpStatus.CREATED)
  @PostMapping("/create")
  public ShowtimeResponse createShowtime(@RequestBody @Valid CreateShowtimeRequest request) {
    return showtimeService.createShowtime(request);
  }
}
