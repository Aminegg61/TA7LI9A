package com.ajemi.barber.Ta7li9_app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ajemi.barber.Ta7li9_app.dto.LoginResponse;
import com.ajemi.barber.Ta7li9_app.dto.RegisterResponse;
import com.ajemi.barber.Ta7li9_app.dto.RequestLogin;
import com.ajemi.barber.Ta7li9_app.dto.RequestRegister;
import com.ajemi.barber.Ta7li9_app.service.AuthService;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> registerUser(@Valid @RequestBody RequestRegister body) {
        LoginResponse response = authService.register(body);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUser(@Valid @RequestBody RequestLogin body) {
        LoginResponse response = authService.login(body);
        return ResponseEntity.ok(response);
    }
}
