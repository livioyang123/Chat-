
// src/main/java/com/chat/demo/controller/OnlineStatusController.java
package com.chat.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;
import java.util.Set;

@Controller
public class OnlineStatusController {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Utente va online
    @MessageMapping("/user.online")
    public void userOnline(@Payload Map<String, String> payload) {
        String userId = payload.get("userId");
        String chatroomId = payload.get("chatroomId");
        
        if (userId == null || chatroomId == null) return;

        // Salva in Redis con heartbeat
        String key = "online:" + chatroomId;
        redisTemplate.opsForSet().add(key, userId);
        redisTemplate.expire(key, Duration.ofSeconds(30)); // Refresh ogni 30s

        // Notifica agli altri utenti
        messagingTemplate.convertAndSend(
            "/topic/chatroom/" + chatroomId + "/status",
            Map.of(
                "userId", userId,
                "status", "online"
            )
        );
    }

    // Utente va offline
    @MessageMapping("/user.offline")
    public void userOffline(@Payload Map<String, String> payload) {
        String userId = payload.get("userId");
        String chatroomId = payload.get("chatroomId");
        
        if (userId == null || chatroomId == null) return;

        String key = "online:" + chatroomId;
        redisTemplate.opsForSet().remove(key, userId);

        messagingTemplate.convertAndSend(
            "/topic/chatroom/" + chatroomId + "/status",
            Map.of(
                "userId", userId,
                "status", "offline"
            )
        );
    }
}

@RestController
class OnlineStatusRestController {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    // GET online users in a chat
    @GetMapping("/api/chatrooms/{chatroomId}/online-users")
    public Set<Object> getOnlineUsers(@PathVariable String chatroomId) {
        String key = "online:" + chatroomId;
        return redisTemplate.opsForSet().members(key);
    }
  
}
