package com.chat.demo.controller;

import com.chat.demo.data.dto.ErrorResponse;
import com.chat.demo.data.entity.Chatroom;
import com.chat.demo.data.entity.Message;
import com.chat.demo.data.service.ChatroomService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/chatrooms")
@RequiredArgsConstructor
public class ChatroomController {
    
    private final ChatroomService chatroomService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public ResponseEntity<Chatroom> createChatRoom(@RequestBody Chatroom chatroom) {
        return ResponseEntity.ok(chatroomService.createRoom(chatroom));
    }

    @GetMapping
    public List<Chatroom> getAllChatRooms() {
        return chatroomService.getAllRooms();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Chatroom> getChatRoomById(@PathVariable String id) {
        return chatroomService.getRoomById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<Chatroom> getChatRoomByName(@PathVariable String name) {
        return chatroomService.getRoomByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChatRoom(@PathVariable String id) {
        chatroomService.deleteRoomById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/participant/{userId}")
    public List<Chatroom> getChatRoomsByParticipantId(@PathVariable String userId) {
        return chatroomService.getRoomsByParticipantId(userId);
    }

    // ✅ FIX: Aggiungi membro CON notifica WebSocket
    @PutMapping("/{id}/add-participant/{userId}")
    public ResponseEntity<?> addParticipantToChatRoom(
            @PathVariable String id, 
            @PathVariable String userId,
            @RequestParam(required = false) String addedBy) {
        
        Optional<Chatroom> result = chatroomService.addParticipantToRoom(id, userId);
        
        if (result.isPresent()) {
            Chatroom chatroom = result.get();
            
            // Invia notifica via WebSocket
            sendMemberChangeNotification(
                id, 
                userId, 
                addedBy != null ? addedBy : "SYSTEM",
                "MEMBER_ADDED"
            );
            
            return ResponseEntity.ok(chatroom);
        }
        
        return ResponseEntity.notFound().build();
    }

    // ✅ FIX: Rimuovi membro CON notifica WebSocket
    @PutMapping("/{id}/remove-participant/{userId}")
    public ResponseEntity<?> removeParticipantFromChatRoom(
            @PathVariable String id, 
            @PathVariable String userId,
            @RequestParam(required = false) String removedBy) {
        
        Optional<Chatroom> result = chatroomService.removeParticipantFromRoom(id, userId);
        
        if (result.isPresent()) {
            Chatroom chatroom = result.get();
            
            // Invia notifica via WebSocket
            sendMemberChangeNotification(
                id, 
                userId, 
                removedBy != null ? removedBy : "SYSTEM",
                "MEMBER_REMOVED"
            );
            
            return ResponseEntity.ok(chatroom);
        }
        
        return ResponseEntity.notFound().build();
    }

    // ✅ FIX: Abbandona gruppo CON notifica WebSocket
    @PostMapping("/{id}/leave")
    public ResponseEntity<?> leaveGroup(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            String username = request.get("username");
            
            if (userId == null || userId.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("User ID richiesto"));
            }
            
            Optional<Chatroom> chatroomOpt = chatroomService.getRoomById(id);
            if (chatroomOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Chatroom chatroom = chatroomOpt.get();
            
            if (!chatroom.getParticipantIds().contains(userId)) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Utente non nel gruppo"));
            }
            
            // Rimuovi utente
            chatroom.getParticipantIds().remove(userId);
            
            // ✅ NOTIFICA: Utente ha abbandonato
            sendLeaveGroupNotification(id, userId, username);
            
            // Se non ci sono più membri, elimina il gruppo
            if (chatroom.getParticipantIds().isEmpty()) {
                chatroomService.deleteRoomById(id);
                return ResponseEntity.ok(Map.of(
                    "message", "Gruppo eliminato (nessun membro rimasto)"
                ));
            }
            
            // Salva modifiche
            chatroomService.createRoom(chatroom);
            
            return ResponseEntity.ok(Map.of(
                "message", "Utente rimosso dal gruppo con successo",
                "chatroom", chatroom
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Errore: " + e.getMessage()));
        }
    }

    // ✅ Helper: Invia notifica cambio membri
    private void sendMemberChangeNotification(
            String chatId, 
            String userId, 
            String actionBy, 
            String action) {
        
        Message notification = new Message();
        notification.setId(UUID.randomUUID().toString());
        notification.setSenderId("SYSTEM");
        notification.setChatRoomId(chatId);
        notification.setType(Message.MessageType.CHAT);
        notification.setTimestamp(LocalDateTime.now());
        
        String content = action.equals("MEMBER_ADDED") 
            ? userId + " è stato aggiunto al gruppo"
            : userId + " è stato rimosso dal gruppo";
        
        notification.setContent(content);
        
        messagingTemplate.convertAndSend("/topic/chatroom/" + chatId, notification);
    }

    // ✅ Helper: Invia notifica abbandono gruppo
    private void sendLeaveGroupNotification(String chatId, String userId, String username) {
        Message notification = new Message();
        notification.setId(UUID.randomUUID().toString());
        notification.setSenderId("SYSTEM");
        notification.setChatRoomId(chatId);
        notification.setType(Message.MessageType.CHAT);
        notification.setTimestamp(LocalDateTime.now());
        notification.setContent(
            (username != null ? username : userId) + " ha abbandonato il gruppo"
        );
        
        messagingTemplate.convertAndSend("/topic/chatroom/" + chatId, notification);
    }
}