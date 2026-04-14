package com.ajemi.barber.Ta7li9_app.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF hit khdamin b JWT
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Ma-ghadi-ch n-khbiw session f l-server
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll() // Register w Login m-7loulin l-kolchi
                // ⚡ 1. 7el l-khit d l-WebSocket (Handshake)
                .requestMatchers("/ws-ta7li9a/**").permitAll() 
                
                // ⚡ 2. 7el l-endpoint d l-status bach klyan i-choufou bla login
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/barber/status/**").permitAll()
                // ⚡ 3. 7el l-endpoint d l-services bach l-klyan i-choufou services dyal barber bla wlo
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/services/barber/**").permitAll()
                .anyRequest().authenticated() // Ay 7aja khora m-7miya
            );

        // Zid l-Filter dyalna qbel l-Filter dyal Spring s-standard
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        // Hadi ghir bach n-skto Spring Security mn dak l-password l-ghrib
        return email -> { throw new UsernameNotFoundException("Use JWT instead"); };
    }


    // @Bean
    // public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    //     http
    //         .csrf(csrf -> csrf.disable()) // Disable CSRF f l-bdaya bach mat-mrtkch f les tests
    //         .authorizeHttpRequests(auth -> auth
    //             .anyRequest().authenticated() // Ay haja khassha t-login
    //         )
    //         .oauth2Login(withDefaults()); // F33el Google Login
            
    //     return http.build();
    // }
}
