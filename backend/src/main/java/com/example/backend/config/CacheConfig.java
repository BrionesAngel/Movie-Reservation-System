package com.example.backend.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CacheConfig {

  @Bean
  public CacheManager cacheManager(
      @Value("${app.cache.movies.spec}") String moviesSpec,
      @Value("${app.cache.movie.spec}") String movieSpec,
      @Value("${app.cache.movie-options.spec}") String movieOptionsSpec,
      @Value("${app.cache.upcoming-movies.spec}") String upcomingMoviesSpec,
      @Value("${app.cache.showtime.spec}") String showtimeSpec,
      @Value("${app.cache.showtimes-by-date.spec}") String showtimesByDateSpec,
      @Value("${app.cache.showtimes-by-movie.spec}") String showtimesByMovieSpec,
      @Value("${app.cache.upcoming-showtimes.spec}") String upcomingShowtimesSpec) {

    CaffeineCacheManager manager = new CaffeineCacheManager();
    manager.setAllowNullValues(false);

    manager.registerCustomCache(
        "movies",
        Caffeine.from(moviesSpec).build());

    manager.registerCustomCache(
        "movie",
        Caffeine.from(movieSpec).build());

    manager.registerCustomCache(
        "movie-options",
        Caffeine.from(movieOptionsSpec).build());

    manager.registerCustomCache(
        "upcoming-movies",
        Caffeine.from(upcomingMoviesSpec).build());

    manager.registerCustomCache(
        "showtime",
        Caffeine.from(showtimeSpec).build());

    manager.registerCustomCache(
        "showtimes-by-date",
        Caffeine.from(showtimesByDateSpec).build());

    manager.registerCustomCache(
        "showtimes-by-movie",
        Caffeine.from(showtimesByMovieSpec).build());

    manager.registerCustomCache(
        "upcoming-showtimes",
        Caffeine.from(upcomingShowtimesSpec).build());

    return manager;
  }
}
