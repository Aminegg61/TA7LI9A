package com.ajemi.barber.Ta7li9_app.dto;

import com.ajemi.barber.Ta7li9_app.entity.BarberStatus;

import lombok.Data;

@Data
public class BarberSearchDto {

    private Long id;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private BarberStatus currentStatus;
    private boolean favorite;
    private int estimatedWaitTime;
    private boolean inQueue;
}
