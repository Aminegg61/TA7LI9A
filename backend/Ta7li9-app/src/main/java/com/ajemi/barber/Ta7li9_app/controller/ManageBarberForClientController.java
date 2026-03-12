package com.ajemi.barber.Ta7li9_app.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ajemi.barber.Ta7li9_app.dto.BarberSearchDto;
import com.ajemi.barber.Ta7li9_app.security.UserPrincipal;
import com.ajemi.barber.Ta7li9_app.service.ManageBarberService;

@RestController
@RequestMapping("/api/barbers")
public class ManageBarberForClientController {
    @Autowired
    private ManageBarberService manageBarberService;
    @GetMapping("/search")
    public ResponseEntity<List<BarberSearchDto>> searchBarbers(@RequestParam("q") String query,
        @AuthenticationPrincipal UserPrincipal currentUser) {
        List<BarberSearchDto> results = manageBarberService.findBarberForClient(query,currentUser.getId());
        return ResponseEntity.ok(results);
    }

    @PostMapping("/add-barber/{barberId}")
    public ResponseEntity<String> addBarber(
        @AuthenticationPrincipal UserPrincipal currentUser, 
        @PathVariable Long barberId) {
        
        manageBarberService.addBarberToMyList(currentUser.getId(), barberId);
        return ResponseEntity.ok("Barber t-zad l d-dashboard dyalk!");
    }

    @GetMapping("/my-barbers")
    public ResponseEntity<List<BarberSearchDto>> getMyBarbers(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<BarberSearchDto> myBarbers = manageBarberService.getMyBarbers(currentUser.getId());
        return ResponseEntity.ok(myBarbers);
    }

    @GetMapping("/my-favorites")
    public ResponseEntity<List<BarberSearchDto>> getMyFavorites(@AuthenticationPrincipal UserPrincipal currentUser) {
        // L-favorites bo7dhom
        List<BarberSearchDto> favorites = manageBarberService.getMyFavoriteBarbers(currentUser.getId());
        return ResponseEntity.ok(favorites);
    }

    @DeleteMapping("/remove-barber/{barberId}")
    public ResponseEntity<Void> removeBarber(
            @AuthenticationPrincipal UserPrincipal currentUser, 
            @PathVariable Long barberId) {
        
        manageBarberService.removeBarberFromMyList(currentUser.getId(), barberId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/toggle-favorite/{barberId}")
    public ResponseEntity<Void> toggleFavorite(
            @AuthenticationPrincipal UserPrincipal currentUser, 
            @PathVariable Long barberId) {
        
        manageBarberService.toggleFavoriteStatus(currentUser.getId(), barberId);
        return ResponseEntity.ok().build();
    }
}
