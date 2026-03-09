package com.ajemi.barber.Ta7li9_app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ajemi.barber.Ta7li9_app.entity.BarberStatus;
import com.ajemi.barber.Ta7li9_app.entity.User;
import com.ajemi.barber.Ta7li9_app.repository.UserRepository;

@Service
public class BarberService {
    @Autowired private UserRepository userRepository;
    // ⚡ Had l-outil houwa li kiy-sift l-messages f WebSocket
    @Autowired private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void toggleStatus(Long coiffeurId, String newStatus) {
        BarberStatus status = fromString(newStatus);
        // 1. Update f l-Base de données
        User coiffeur = userRepository.findById(coiffeurId).get();
        coiffeur.setCurrentStatus(status);
        userRepository.save(coiffeur);

        // 2. Sift l-išara (The Signal)
        // Topic: /topic/status/{id} -> L-klyan kiy-koun m-connecti hna
        String topic = "/topic/status/" + coiffeurId;
        
        // Sift ghir s-smiya d l-status jdid
        messagingTemplate.convertAndSend(topic, newStatus.toUpperCase());
    }

    private  static BarberStatus fromString(String value) {
        return BarberStatus.valueOf(value.toUpperCase());
    }
}
