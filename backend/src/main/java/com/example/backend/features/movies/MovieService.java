package com.example.backend.features.movies;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.features.genres.Genre;
import com.example.backend.features.genres.GenreRepository;
import com.example.backend.features.movies.DTOs.MovieRequest;
import com.example.backend.features.movies.DTOs.MovieResponse;
import com.example.backend.features.movies.exceptions.MovieHasShowtimesException;
import com.example.backend.features.showtimes.ShowtimeRepository;
import com.example.backend.shared.exceptions.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MovieService {

  private final MovieRepository movieRepository;
  private final GenreRepository genreRepository;
  private final ShowtimeRepository showtimeRepository;

  public List<MovieResponse> getMovies() {
    return movieRepository.findAll().stream()
        .map(this::toMovieResponse)
        .toList();
  }

  public MovieResponse getMovie(Long id) {
    Movie movie = movieRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("movie not found"));
    return this.toMovieResponse(movie);
  }

  @Transactional
  public MovieResponse addMovie(MovieRequest request) {
    Set<Genre> genres = this.getGenres(request.genres());

    Movie movie = Movie.builder()
        .title(request.title())
        .description(request.description())
        .durationMinutes(request.durationMinutes())
        .posterUrl(request.posterUrl())
        .genres(genres)
        .build();

    Movie saved = movieRepository.save(movie);

    return this.toMovieResponse(saved);
  }

  @Transactional
  public MovieResponse updateMovie(Long id, MovieRequest request) {
    Movie movie = movieRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("movie not found"));

    Set<Genre> genres = this.getGenres(request.genres());

    movie.setTitle(request.title());
    movie.setDescription(request.description());
    movie.setDurationMinutes(request.durationMinutes());
    movie.setPosterUrl(request.posterUrl());
    movie.setGenres(genres);

    return this.toMovieResponse(movie);
  }

  @Transactional
  public void deleteMovie(Long id) {
    movieRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("movie not found"));

    if (showtimeRepository.existsByMovieId(id)) {
      throw new MovieHasShowtimesException("movie: " + id + " has related showtimes");
    }

    movieRepository.deleteById(id);
  }

  public Set<Genre> getGenres(Set<Long> genreIds) {
    return genreRepository.findAllById(genreIds).stream()
        .collect(Collectors.toSet());
  }

  public MovieResponse toMovieResponse(Movie movie) {
    return new MovieResponse(
        movie.getId(),
        movie.getTitle(),
        movie.getDescription(),
        movie.getDurationMinutes(),
        movie.getPosterUrl(),
        movie.getGenres());
  }
}
