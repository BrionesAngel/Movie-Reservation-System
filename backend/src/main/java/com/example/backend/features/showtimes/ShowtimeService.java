package com.example.backend.features.showtimes;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.features.movies.Movie;
import com.example.backend.features.movies.MovieRepository;
import com.example.backend.features.rooms.Room;
import com.example.backend.features.rooms.RoomRepository;
import com.example.backend.features.showtimes.DTOs.CreateShowtimeRequest;
import com.example.backend.features.showtimes.DTOs.CreateShowtimeResponse;
import com.example.backend.features.showtimes.exceptions.ShowtimeConflictException;
import com.example.backend.shared.exceptions.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShowtimeService {

  private static final int CLEANING_ROOM_MINUTES = 15;

  private final ShowtimeRepository showtimeRepository;
  private final MovieRepository movieRepository;
  private final RoomRepository roomRepository;

  @Transactional
  public CreateShowtimeResponse createShowtime(CreateShowtimeRequest request){
    Movie movie = movieRepository.findById(request.movieId())
      .orElseThrow(() -> new ResourceNotFoundException("Movie " + request.movieId() + " not found"));

    Room room = roomRepository.findById(request.roomId())
      .orElseThrow(() -> new ResourceNotFoundException("Room " + request.roomId() + " not found"));

    LocalDateTime endTime = calculateEndTime(request.startTime(), movie.getDurationMinutes());

    if(showtimeRepository.existsOverlapping(room.getId(), request.startTime(), endTime)){
      throw new ShowtimeConflictException("room " + room.getId() + " is already booked at that time");
    }

    Showtime showtime = Showtime.builder()
      .movie(movie)
      .room(room)
      .startTime(request.startTime())
      .endTime(endTime)
      .price(request.price())
      .build();

    Showtime savedShowtime = showtimeRepository.save(showtime);
    return toShowtimeResponse(savedShowtime);
  }

  public CreateShowtimeResponse toShowtimeResponse(Showtime showtime){
    return new CreateShowtimeResponse(
      showtime.getId(),
      showtime.getMovie().getId(),
      showtime.getRoom().getId(),
      showtime.getStartTime(),
      showtime.getEndTime(),
      showtime.getPrice());
  }

  public LocalDateTime calculateEndTime(LocalDateTime startTime, int durationMinutes){
    return startTime.plusMinutes(durationMinutes + CLEANING_ROOM_MINUTES);
  }

}
