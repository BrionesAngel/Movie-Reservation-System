package com.example.backend.features.seats;

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
 
  @Column(nullable = false)
  private Integer row;

  @Column(nullable = false)
  private Integer number;
}
