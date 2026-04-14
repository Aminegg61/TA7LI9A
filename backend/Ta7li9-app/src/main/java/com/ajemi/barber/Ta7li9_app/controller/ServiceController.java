package com.ajemi.barber.Ta7li9_app.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ajemi.barber.Ta7li9_app.dto.ServiceRequestDTO;
import com.ajemi.barber.Ta7li9_app.dto.ServiceResponseDTO;
import com.ajemi.barber.Ta7li9_app.security.UserPrincipal;
import com.ajemi.barber.Ta7li9_app.service.ServicesBarberService;

import jakarta.validation.Valid;




@RestController
@RequestMapping("/api/services")
public class ServiceController {
    @Autowired
    private ServicesBarberService serviceService;

    @PostMapping("/add")
    @PreAuthorize("hasRole('COIFFEUR')")
    public ResponseEntity<ServiceResponseDTO> addService(
            @Valid @RequestBody ServiceRequestDTO requestDTO,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        // L-controller kay-3ti l-ID d l-user l l-service layer
        ServiceResponseDTO response = serviceService.addService(requestDTO, currentUser.getId());
        return ResponseEntity.ok(response);
    }


    @GetMapping("/my-services")
    @PreAuthorize("hasRole('COIFFEUR')")
    public ResponseEntity<List<ServiceResponseDTO>> getMyServices(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(serviceService.getCoiffeurServices(currentUser.getId()));
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('COIFFEUR')")
    public ResponseEntity<ServiceResponseDTO> updateService(
            @PathVariable Long id, 
            @Valid @RequestBody ServiceRequestDTO requestDTO,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        // currentUser.getId() kiy-ji mn l-token, ma-i-qder 7ta wahed i-zowwro
        ServiceResponseDTO response = serviceService.updateService(id, requestDTO, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('COIFFEUR')")
    public ResponseEntity<String> deleteService(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        serviceService.deleteService(id, currentUser.getId());
        return ResponseEntity.ok("Service t-mssa7 b naja7!");
    }

    @GetMapping("/barber/{coiffeurId}")
    public ResponseEntity<List<ServiceResponseDTO>> getBarberServices(@PathVariable Long coiffeurId) {
        return ResponseEntity.ok(serviceService.getCoiffeurServices(coiffeurId));
    }
}
