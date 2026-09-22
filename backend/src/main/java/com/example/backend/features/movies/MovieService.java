package com.example.backend.features.movies;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.features.genres.Genre;
import com.example.backend.features.genres.GenreRepository;
import com.example.backend.features.movies.DTOs.MovieOptionResponse;
import com.example.backend.features.movies.DTOs.MovieRequest;
import com.example.backend.features.movies.DTOs.MovieResponse;
import com.example.backend.features.movies.exceptions.DuplicateMovieException;
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

  @Cacheable("movies")
  public List<MovieResponse> getMovies() {
    return movieRepository.findAllWithGenres().stream()
        .map(this::toMovieResponse)
        .toList();
  }

  @Cacheable(value = "movie", key = "#id")
  public MovieResponse getMovie(Long id) {
    Movie movie = movieRepository.findAllWithGenresByIdIn(List.of(id)).stream()
        .findFirst()
        .orElseThrow(() -> new ResourceNotFoundException("movie not found"));
    return this.toMovieResponse(movie);
  }

  @Cacheable("upcoming-movies")
  public List<MovieResponse> getUpcomingMovies() {
    List<Long> upcomingMovieIds = showtimeRepository.findDistinctMovieIdsByStartTimeAfter(Instant.now());
    if (upcomingMovieIds.isEmpty()) {
      return List.of();
    }

    return movieRepository.findAllWithGenresByIdIn(upcomingMovieIds).stream()
        .map(this::toMovieResponse)
        .toList();
  }

  @Cacheable("movie-options")
  public List<MovieOptionResponse> getMovieOptions() {
    return movieRepository.findAllMovieOptions();
  }

  @Transactional
  @Caching(evict = {
      @CacheEvict(value = "movies", allEntries = true),
      @CacheEvict(value = "upcoming-movies", allEntries = true),
      @CacheEvict(value = "movie-options", allEntries = true)
  })
  public MovieResponse addMovie(MovieRequest request) {
    if (movieRepository.existsByTitle(request.title()))
      throw new DuplicateMovieException("movie with title: " + request.title() + " already exists");

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
  @Caching(evict = {
      @CacheEvict(value = "movies", allEntries = true),
      @CacheEvict(value = "upcoming-movies", allEntries = true),
      @CacheEvict(value = "movie-options", allEntries = true),
      @CacheEvict(value = "movie", key = "#id")
  })
  public MovieResponse updateMovie(Long id, MovieRequest request) {
    Movie movie = movieRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("movie not found"));

    Movie movieCheck = movieRepository.findByTitle(request.title())
        .orElseThrow(() -> new ResourceNotFoundException("movie not found"));

    if (movie.getId() != movieCheck.getId())
      throw new DuplicateMovieException("movie with title: " + request.title() + " already exists");

    Set<Genre> genres = this.getGenres(request.genres());

    movie.setTitle(request.title());
    movie.setDescription(request.description());
    movie.setDurationMinutes(request.durationMinutes());
    movie.setPosterUrl(request.posterUrl());
    movie.setGenres(genres);

    return this.toMovieResponse(movie);
  }

  @Transactional
  @Caching(evict = {
      @CacheEvict(value = "movies", allEntries = true),
      @CacheEvict(value = "upcoming-movies", allEntries = true),
      @CacheEvict(value = "movie-options", allEntries = true),
      @CacheEvict(value = "movie", key = "#id")
  })
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
