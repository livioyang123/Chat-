package com.chat.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.lang.NonNull;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // Endpoint principale per chat
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*") // Cambiato da specifico a wildcard
                .withSockJS()
                .setHeartbeatTime(25000); // Heartbeat ogni 25 secondi
        
        // Endpoint senza SockJS per debugging
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*");
        
        // Endpoint dedicato per WebRTC signaling (opzionale)
        registry.addEndpoint("/ws-webrtc")
                .setAllowedOriginPatterns("*") // Cambiato da setAllowedOrigins
                .withSockJS()
                .setHeartbeatTime(25000);
    }

    @Bean
    public TaskScheduler heartBeatScheduler() {
        return new ThreadPoolTaskScheduler();
    }

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        // Abilita il broker semplice per i topic
        registry.enableSimpleBroker("/topic", "/queue", "/user")
                .setTaskScheduler(heartBeatScheduler()); // Heartbeat configurato
        
        // Prefisso per messaggi in ingresso
        registry.setApplicationDestinationPrefixes("/app");
        
        // Prefisso per messaggi diretti agli utenti
        registry.setUserDestinationPrefix("/user");
    }
}
