package com.ajemi.barber.Ta7li9_app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.ajemi.barber.Ta7li9_app.dto.LoginResponse;
import com.ajemi.barber.Ta7li9_app.dto.RequestLogin;
import com.ajemi.barber.Ta7li9_app.dto.RequestRegister;
import com.ajemi.barber.Ta7li9_app.entity.User;
import com.ajemi.barber.Ta7li9_app.repository.UserRepository;
import com.ajemi.barber.Ta7li9_app.security.JwtUtils;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    public void register(RequestRegister body) {
        if (userRepository.existsByEmail(body.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if(userRepository.existsByPhoneNumber(body.getPhoneNumber())){
            throw new RuntimeException("Phone already exists");
        }
        if (body.getRole().equalsIgnoreCase("ADMIN")) {
            throw new RuntimeException("Ma-ymknch t-creer Admin mn hna!");
        }
        // 1. Verifier wach passwords matchiyen
        if (!body.getPassword().equals(body.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match!");
        }
        
        User user = new User();
        String role = body.getRole().toUpperCase();
        if (role.equals("CLIENT") || role.equals("COIFFEUR")) {
            user.setRole("ROLE_" + role);
        } else {
            user.setRole("ROLE_CLIENT"); // Default role
        }
        
        user.setFirstName(body.getFirstName());
        user.setLastName(body.getLastName());
        user.setEmail(body.getEmail());
        user.setPassword(passwordEncoder.encode(body.getPassword()));
        user.setPhoneNumber(body.getPhoneNumber());
        userRepository.save(user);
    }

    public LoginResponse login(RequestLogin body) {
        // 1. Gelleb 3la l-user
        User user = userRepository.findByPhoneNumber(body.getPhoneNumber())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Checki password m-hashi
        if (!passwordEncoder.matches(body.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // 3. Generi l-token
        String token = jwtUtils.generateJwtToken(user);
        // 4. Rjje3 l-DTO kamel
        return new LoginResponse(token, user.getEmail(), user.getRole());
    }  
}