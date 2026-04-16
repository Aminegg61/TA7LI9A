package com.ajemi.barber.Ta7li9_app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ajemi.barber.Ta7li9_app.security.UserPrincipal;
import com.ajemi.barber.Ta7li9_app.service.BarberService;


@RestController
@RequestMapping("/api/barber")
@PreAuthorize("hasRole('COIFFEUR')")
public class BarberController {
    @Autowired private BarberService barberService;
    @PutMapping("/status")
    public ResponseEntity<Void> updateStatus(
        @AuthenticationPrincipal UserPrincipal currentUser,
        @RequestParam String status) {
            barberService.toggleStatus(currentUser.getId(), status);
            return ResponseEntity.ok().build();
        }
     
    @GetMapping("/status")
    // @PreAuthorize("hasRole('COIFFEUR')")
    public ResponseEntity<String> getStatus(@AuthenticationPrincipal UserPrincipal currentUser) {
        String status = barberService.getBarberStatus(currentUser.getId());
        return ResponseEntity.ok(status);
    }    

}
