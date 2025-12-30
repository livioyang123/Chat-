package com.chat.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.Duration;
import java.util.Map;
import java.util.Set;

@Controller
public class TypingController {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    // Utente inizia a scrivere
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload Map<String, String> payload) {
        String chatId = payload.get("chatRoomId");
        String userId = payload.get("userId");
        String username = payload.get("username");
        
        if (chatId == null || userId == null) return;

        // Salva in Redis con TTL di 3 secondi
        String key = "typing:" + chatId;
        redisTemplate.opsForHash().put(key, userId, username);
        redisTemplate.expire(key, Duration.ofSeconds(3));

        // Notifica tutti gli altri nella chat
        messagingTemplate.convertAndSend(
            "/topic/chatroom/" + chatId + "/typing",
            Map.of(
                "userId", userId,
                "username", username,
                "isTyping", true
            )
        );
    }

    // Utente smette di scrivere
    @MessageMapping("/chat.stopTyping")
    public void handleStopTyping(@Payload Map<String, String> payload) {
        String chatId = payload.get("chatRoomId");
        String userId = payload.get("userId");
        
        if (chatId == null || userId == null) return;

        // Rimuovi da Redis
        String key = "typing:" + chatId;
        redisTemplate.opsForHash().delete(key, userId);

        // Notifica stop typing
        messagingTemplate.convertAndSend(
            "/topic/chatroom/" + chatId + "/typing",
            Map.of(
                "userId", userId,
                "isTyping", false
            )
        );
    }
}

