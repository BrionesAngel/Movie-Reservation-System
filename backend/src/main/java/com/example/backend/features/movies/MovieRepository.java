package com.example.backend.features.movies;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.backend.features.movies.DTOs.MovieOptionResponse;

public interface MovieRepository extends JpaRepository<Movie, Long> {

  @Query("SELECT DISTINCT m FROM Movie m LEFT JOIN FETCH m.genres")
  List<Movie> findAllWithGenres();

  @Query("SELECT DISTINCT m FROM Movie m LEFT JOIN FETCH m.genres WHERE m.id IN :ids")
  List<Movie> findAllWithGenresByIdIn(Collection<Long> ids);

  @Query("SELECT new com.example.backend.features.movies.DTOs.MovieOptionResponse(m.id, m.title) FROM Movie m ORDER BY m.title")
  List<MovieOptionResponse> findAllMovieOptions();

  boolean existsByTitle(String title);

  Optional<Movie> findByTitle(String title);
}
