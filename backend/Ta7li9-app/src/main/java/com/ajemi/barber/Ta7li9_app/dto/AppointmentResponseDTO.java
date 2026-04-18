package com.ajemi.barber.Ta7li9_app.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AppointmentResponseDTO {
    private Long id;
    private Long barberId;
    private Long clientId;
    private String clientName;      // Smiya d l-User wala l-Manual Name
    private List<String> serviceNames; // Smiyat d les services (bach n-affichiwhom)
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    // T-qder t-zid duration total bach t-shhel l-7sab f Angular
    private int totalDuration;
}