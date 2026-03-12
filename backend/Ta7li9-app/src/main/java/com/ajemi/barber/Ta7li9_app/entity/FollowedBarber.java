package com.ajemi.barber.Ta7li9_app.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
@Table(name = "followed_barbers")
public class FollowedBarber {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private User client; // L-klyan li dar "Add"

    @ManyToOne
    @JoinColumn(name = "barber_id")
    private User barber; // L-coiffeur li t-zad
    private boolean isFavorite = false;
    private LocalDateTime followedAt = LocalDateTime.now();
}
