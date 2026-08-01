package com.example.backend.features.seats;

import com.example.backend.features.rooms.Room;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "seats")
public class Seat {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "room_id", nullable = false)
  private Room room;
 
  @Column(length = 2, nullable = false)
  private String row;

  @Column(nullable = false)
  private Short number;

  @Enumerated(EnumType.STRING)
  @Column(length = 15,nullable = false)
  private SeatStatus status;
}
