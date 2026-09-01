package com.example.backend.features.genres;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/genres")
@RequiredArgsConstructor
public class GenreController {

  private final GenreRepository genreRepository;

  @GetMapping
  @ResponseStatus(HttpStatus.OK)
  public List<Genre> getGenres() {
    return genreRepository.findAll();
  }
}