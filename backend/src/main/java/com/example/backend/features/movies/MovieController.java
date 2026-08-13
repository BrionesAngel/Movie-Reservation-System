package com.example.backend.features.movies;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.features.movies.DTOs.MovieRequest;
import com.example.backend.features.movies.DTOs.MovieResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/movies")
public class MovieController {

  private final MovieService movieService;

  @GetMapping
  @ResponseStatus(HttpStatus.OK)
  public List<MovieResponse> getMovies(){
    return movieService.getMovies();
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping("/add")
  @ResponseStatus(HttpStatus.CREATED)
  public MovieResponse addMovie(@Valid @RequestBody MovieRequest request) {
    return movieService.addMovie(request);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PatchMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  public MovieResponse updateMovie(@PathVariable Long id ,@Valid @RequestBody MovieRequest request) {
    return movieService.updateMovie(id, request);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteMovie(@PathVariable Long id) {
    movieService.deleteMovie(id);
  }

}
