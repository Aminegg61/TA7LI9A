package com.ajemi.barber.Ta7li9_app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;


@Getter@Setter
public class RequestLogin {
    @NotBlank(message = "Email is required")
    private String phoneNumber;

    @NotBlank(message = "Password is required")
    private String password;
}
