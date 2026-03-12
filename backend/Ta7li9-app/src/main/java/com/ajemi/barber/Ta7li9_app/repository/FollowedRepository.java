package com.ajemi.barber.Ta7li9_app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ajemi.barber.Ta7li9_app.entity.FollowedBarber;
import com.ajemi.barber.Ta7li9_app.entity.User;


public interface FollowedRepository extends JpaRepository<FollowedBarber, Long>{
    boolean existsByClientAndBarber(User client, User barber);
    List<FollowedBarber> findByClientIdAndIsFavorite(Long clientId,boolean isFavorite);
    void deleteByClientIdAndBarberId(Long clientId, Long barberId);
    Optional<FollowedBarber> findByClientIdAndBarberId(Long client, Long barber);
}
