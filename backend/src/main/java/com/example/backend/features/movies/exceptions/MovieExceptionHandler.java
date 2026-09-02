package com.example.backend.features.movies.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.backend.shared.exceptions.BaseExceptionHandler;
import com.example.backend.shared.exceptions.ErrorResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class MovieExceptionHandler extends BaseExceptionHandler {

  @ExceptionHandler(MovieHasShowtimesException.class)
  public ResponseEntity<ErrorResponse> handleMovieHasShowtimes(MovieHasShowtimesException ex) {
    log.warn("Movie cannot be deleted: {}", ex.getMessage());
    return buildError(HttpStatus.CONFLICT, "MOVIE_HAS_SHOWTIMES");
  }
}