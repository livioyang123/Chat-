package com.chat.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOriginPatterns("http://localhost:3000", "http://localhost:3001") // Aggiungi altre origini se necessario
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .exposedHeaders("Accept-Ranges", "Content-Range", "Content-Length", "Content-Type")
                        .allowCredentials(true) // ESSENZIALE per i cookie
                        .exposedHeaders("Set-Cookie"); // Permette al browser di leggere il cookie

                // Configurazione specifica per WebSocket
                registry.addMapping("/ws-chat/**")
                        .allowedOriginPatterns("*")
                        .allowedMethods("*")
                        .allowedHeaders("*")
                        .allowCredentials(true);
                        
                registry.addMapping("/ws-webrtc/**")
                        .allowedOriginPatterns("*")
                        .allowedMethods("*")
                        .allowedHeaders("*")
                        .allowCredentials(true);

                registry.addMapping("/api/**")
                .allowedOriginPatterns("*") // Use patterns instead of origins
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false) // Set to false if you don't need credentials
                .maxAge(3600);
            }
        };
    }
}