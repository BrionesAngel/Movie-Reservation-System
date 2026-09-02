package com.example.backend.features.rooms;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.shared.exceptions.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

  private final RoomRepository roomRepository;

  @GetMapping
  @ResponseStatus(HttpStatus.OK)
  public List<Room> getRooms() {
    return roomRepository.findAll();
  }

  @GetMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  public Room getRoom(@PathVariable Long id) {
    return roomRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("room: " + id + " not found"));
  }
}