package com.example.backend.features.showtimes;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.features.showtimes.DTOs.CreateShowtimeRequest;
import com.example.backend.features.showtimes.DTOs.CreateShowtimeResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/showtimes")
@RequiredArgsConstructor
public class ShowtimeController {

  private final ShowtimeService showtimeService;

  @PreAuthorize("hasRole('ADMIN')")
  @ResponseStatus(HttpStatus.CREATED)
  @PostMapping("/create")
  public CreateShowtimeResponse createShowtime(@RequestBody @Valid CreateShowtimeRequest request){
    return showtimeService.createShowtime(request);
  }
}
