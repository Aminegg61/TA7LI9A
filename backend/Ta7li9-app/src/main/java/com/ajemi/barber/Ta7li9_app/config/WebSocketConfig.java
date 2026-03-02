package com.ajemi.barber.Ta7li9_app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 1. Topic: Fin ghadi n-7otto l-akhbar (Status, Queue, etc.)
        config.enableSimpleBroker("/topic");
        
        // 2. App: Fin l-frontend kiy-sift lina (ila bghina)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 3. L-URL li ghadi i-t-connecta fih Angular
        registry.addEndpoint("/ws-ta7li9a")
                .setAllowedOrigins("http://localhost:4200")
                .withSockJS(); // Support l les browsers l-qdam
    }
}