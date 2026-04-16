package com.ajemi.barber.Ta7li9_app.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;


@Getter @Setter
public class AppointmentRequestDTO {
    private Long barberId;
    private Long clientId;        // I-qder i-koun null (ila kān Guest)
    private List<Long> serviceIds; // Darori bach n-7sbo l-waqt
    private String manualName;    // Darori ila kān Guest (clientId == null)
    private String manualPhone;   // Optional
}
