package com.chat.demo.controller;

import com.chat.demo.data.entity.Message;
import com.chat.demo.data.service.MessageService;
import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.ZoneId;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessageController {
    
    private static final Logger logger = LoggerFactory.getLogger(MessageController.class);
    
    private final MessageService messageService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping
    public ResponseEntity<Message> createMessage(@RequestBody Message message) {
        return ResponseEntity.ok(messageService.saveMessage(message));
    }

    @GetMapping("/chatroom/{chatRoomId}")
    public ResponseEntity<List<Message>> getMessagesByChatRoom(@PathVariable String chatRoomId) {
        return ResponseEntity.ok(messageService.getMessagesByChatRoomId(chatRoomId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Message> getMessageById(@PathVariable String id) {
        return messageService.getMessageById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<Message> getAllMessages() {
        return messageService.getAllMessages();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable String id) {
        messageService.deleteMessageById(id);
        return ResponseEntity.noContent().build();
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload Message chatMessage) {
        logger.info("=== WEBSOCKET MESSAGE RECEIVED ===");
        logger.info("Type: {}, SenderId: {}, ChatRoomId: {}", 
                   chatMessage.getType(), 
                   chatMessage.getSenderId(), 
                   chatMessage.getChatRoomId());
        
        try {
            // Assegna timestamp e ID se mancanti
            if (chatMessage.getTimestamp() == null) {
                chatMessage.setTimestamp(LocalDateTime.now(ZoneId.of("Europe/Rome")));
            }
            if (chatMessage.getId() == null || chatMessage.getId().isEmpty()) {
                chatMessage.setId(UUID.randomUUID().toString());
            }

            // CORREZIONE PRINCIPALE: Gestione unificata per tutti i messaggi
            switch (chatMessage.getType()) {
                case WEBRTC_SIGNAL:
                    logger.info("Processing WebRTC signal");
                    handleWebRTCSignal(chatMessage);
                    break;
                
                case CALL_INVITATION:
                    logger.info("Processing call invitation");
                    handleCallInvitation(chatMessage);
                    break;
                
                case CALL_EVENT:
                    logger.info("Processing call event");
                    handleCallEvent(chatMessage);
                    break;
                
                default:
                    logger.info("Processing regular chat message");
                    handleChatMessage(chatMessage);
                    break;
            }
            
        } catch (Exception e) {
            logger.error("Error processing WebSocket message", e);
        }
    }

    // CORREZIONE PRINCIPALE: Handler WebRTC semplificato
    private void handleWebRTCSignal(Message chatMessage) {
        logger.info("=== HANDLING WEBRTC SIGNAL ===");
        logger.info("ChatRoomId: {}, Content length: {}", 
                   chatMessage.getChatRoomId(), 
                   chatMessage.getContent() != null ? chatMessage.getContent().length() : 0);
        
        try {
            // Validazione di base
            if (chatMessage.getContent() == null || chatMessage.getContent().trim().isEmpty()) {
                logger.error("WebRTC signal content is null or empty");
                return;
            }
            
            // CORREZIONE: Invia direttamente al topic della chatroom
            // Il frontend filtrerà basandosi sul toUserId nel contenuto
            messagingTemplate.convertAndSend(
                "/topic/chatroom/" + chatMessage.getChatRoomId(), 
                chatMessage
            );
            
            logger.info("WebRTC signal sent to /topic/chatroom/{}", chatMessage.getChatRoomId());
            
        } catch (Exception e) {
            logger.error("Error processing WebRTC signal", e);
        }
    }

    // CORREZIONE PRINCIPALE: Handler inviti semplificato
    private void handleCallInvitation(Message chatMessage) {
        logger.info("=== HANDLING CALL INVITATION ===");
        logger.info("ChatRoomId: {}, SenderId: {}", 
                   chatMessage.getChatRoomId(), 
                   chatMessage.getSenderId());
        
        try {
            // Validazione di base
            if (chatMessage.getContent() == null || chatMessage.getContent().trim().isEmpty()) {
                logger.error("Call invitation content is null or empty");
                return;
            }
            
            // CORREZIONE: Log del contenuto per debug
            logger.info("Invitation content preview: {}", 
                       chatMessage.getContent().substring(0, Math.min(200, chatMessage.getContent().length())));
            
            // CORREZIONE: Invia SOLO al topic generale della chatroom
            // Il frontend gestirà il filtraggio per i destinatari corretti
            messagingTemplate.convertAndSend(
                "/topic/chatroom/" + chatMessage.getChatRoomId(), 
                chatMessage
            );
            
            logger.info("Call invitation sent to /topic/chatroom/{}", chatMessage.getChatRoomId());
            
        } catch (Exception e) {
            logger.error("Error processing call invitation", e);
            
            // Fallback: tenta comunque l'invio
            try {
                messagingTemplate.convertAndSend(
                    "/topic/chatroom/" + chatMessage.getChatRoomId(), 
                    chatMessage
                );
                logger.info("Fallback send successful");
            } catch (Exception fallbackError) {
                logger.error("Fallback send also failed", fallbackError);
            }
        }
    }

    // CORREZIONE PRINCIPALE: Handler eventi semplificato
    private void handleCallEvent(Message chatMessage) {
        logger.info("=== HANDLING CALL EVENT ===");
        logger.info("ChatRoomId: {}, Event content length: {}", 
                   chatMessage.getChatRoomId(),
                   chatMessage.getContent() != null ? chatMessage.getContent().length() : 0);
        
        try {
            // Validazione di base
            if (chatMessage.getContent() == null || chatMessage.getContent().trim().isEmpty()) {
                logger.error("Call event content is null or empty");
                return;
            }
            
            // CORREZIONE: Invia solo al topic generale
            messagingTemplate.convertAndSend(
                "/topic/chatroom/" + chatMessage.getChatRoomId(), 
                chatMessage
            );
            
            logger.info("Call event sent to /topic/chatroom/{}", chatMessage.getChatRoomId());
            
        } catch (Exception e) {
            logger.error("Error processing call event", e);
            
            // Fallback
            try {
                messagingTemplate.convertAndSend(
                    "/topic/chatroom/" + chatMessage.getChatRoomId(), 
                    chatMessage
                );
            } catch (Exception fallbackError) {
                logger.error("Fallback send failed for call event", fallbackError);
            }
        }
    }

    private void handleChatMessage(Message chatMessage) {
        logger.info("=== HANDLING REGULAR CHAT MESSAGE ===");
        logger.info("ChatRoomId: {}, SenderId: {}", 
                   chatMessage.getChatRoomId(), 
                   chatMessage.getSenderId());
        
        try {
            // Salva solo i messaggi di chat normali nel database
            Message savedMessage = messageService.saveMessage(chatMessage);
            logger.info("Chat message saved with ID: {}", savedMessage.getId());
            
            // Invia il messaggio salvato
            messagingTemplate.convertAndSend(
                "/topic/chatroom/" + chatMessage.getChatRoomId(), 
                savedMessage
            );
            
            logger.info("Regular chat message sent to /topic/chatroom/{}", chatMessage.getChatRoomId());
            
        } catch (Exception e) {
            logger.error("Error processing regular chat message", e);
        }
    }

    @MessageMapping("/chat.addUser")
    public void addUser(@Payload Message chatMessage, 
                       SimpMessageHeaderAccessor headerAccessor) {
        logger.info("=== USER JOINING CHAT ===");
        logger.info("UserId: {}, ChatRoomId: {}", 
                   chatMessage.getSenderId(), 
                   chatMessage.getChatRoomId());
        
        try {
            // Aggiungi informazioni alla sessione WebSocket
            Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
            if (sessionAttributes != null) {
                sessionAttributes.put("userId", chatMessage.getSenderId());
                sessionAttributes.put("chatroomId", chatMessage.getChatRoomId());
                logger.info("Session attributes set for user: {}", chatMessage.getSenderId());
            }
            
            chatMessage.setType(Message.MessageType.JOIN);
            chatMessage.setTimestamp(LocalDateTime.now());
            
            // Notifica agli altri utenti
            messagingTemplate.convertAndSend(
                "/topic/chatroom/" + chatMessage.getChatRoomId(), 
                chatMessage
            );
            
            logger.info("User join notification sent to /topic/chatroom/{}", chatMessage.getChatRoomId());
            
        } catch (Exception e) {
            logger.error("Error adding user to chat", e);
        }
    }
    
    // AGGIUNTA: Endpoint per debug delle connessioni WebSocket
    @GetMapping("/debug/websocket")
    public ResponseEntity<Map<String, Object>> getWebSocketDebugInfo() {
        Map<String, Object> debugInfo = new java.util.HashMap<>();
        
        try {
            debugInfo.put("timestamp", LocalDateTime.now().toString());
            debugInfo.put("status", "WebSocket endpoint active");
            debugInfo.put("messagingTemplateClass", messagingTemplate.getClass().getSimpleName());
            
        } catch (Exception e) {
            logger.error("Error getting WebSocket debug info", e);
            debugInfo.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(debugInfo);
    }
    
    // AGGIUNTA: Endpoint per testare l'invio di messaggi
    @PostMapping("/debug/test-send/{chatRoomId}")
    public ResponseEntity<String> testSendMessage(@PathVariable String chatRoomId, @RequestBody String testContent) {
        try {
            Message testMessage = new Message();
            testMessage.setId(UUID.randomUUID().toString());
            testMessage.setSenderId("TEST_SYSTEM");
            testMessage.setChatRoomId(chatRoomId);
            testMessage.setContent(testContent);
            testMessage.setType(Message.MessageType.CHAT);
            testMessage.setTimestamp(LocalDateTime.now());
            
            messagingTemplate.convertAndSend("/topic/chatroom/" + chatRoomId, testMessage);
            
            logger.info("Test message sent to /topic/chatroom/{}", chatRoomId);
            return ResponseEntity.ok("Test message sent successfully");
            
        } catch (Exception e) {
            logger.error("Error sending test message", e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}