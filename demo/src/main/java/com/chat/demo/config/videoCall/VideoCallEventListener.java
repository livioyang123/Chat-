package com.chat.demo.config.videoCall;

import com.chat.demo.data.service.VideoCallService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Component
public class VideoCallEventListener {

    @Autowired
    private VideoCallService videoCallService;
    
    // Mappa per tenere traccia delle sessioni utente
    private final Map<String, String> sessionUserMap = new ConcurrentHashMap<>();

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        String userId = headerAccessor.getFirstNativeHeader("userId");
        
        if (userId != null && sessionId != null) {
            sessionUserMap.put(sessionId, userId);
            System.out.println("User connected: " + userId + " with session: " + sessionId);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        String userId = sessionUserMap.remove(sessionId);
        
        if (userId != null) {
            System.out.println("User disconnected: " + userId + " with session: " + sessionId);
            
            // Gestisce disconnessione automatica dalle chiamate attive
            try {
                var activeCalls = videoCallService.getActiveCallsForUser(userId);
                for (var call : activeCalls) {
                    videoCallService.leaveCall(call.getId(), userId);
                }
            } catch (Exception e) {
                System.err.println("Error handling user disconnect for calls: " + e.getMessage());
            }
        }
    }
}