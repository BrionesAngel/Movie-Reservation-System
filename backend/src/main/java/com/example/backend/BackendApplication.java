package com.example.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

@SpringBootApplication
public class BackendApplication {

  public static void main(String[] args) {
    SpringApplication.run(BackendApplication.class, args);
  }

  @EventListener(ApplicationReadyEvent.class)
  public void onReady() {
    System.out.println("\n" + "=".repeat(50));
    System.out.println("   APP READY ");
    System.out.println("=".repeat(50) + "\n");
  }
}
