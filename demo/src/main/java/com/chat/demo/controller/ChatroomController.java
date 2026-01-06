package com.chat.demo.controller;

import com.chat.demo.data.dto.ErrorResponse;
import com.chat.demo.data.entity.Chatroom;
import com.chat.demo.data.service.ChatroomService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
@RequestMapping("/chatrooms")
@RequiredArgsConstructor
public class ChatroomController {
    private final ChatroomService chatroomService;

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

    @PutMapping("/{id}/add-participant/{userId}")
    public ResponseEntity<Chatroom> addParticipantToChatRoom(@PathVariable String id, @PathVariable String userId) {
        return chatroomService.addParticipantToRoom(id, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/remove-participant/{userId}")
    public ResponseEntity<Chatroom> removeParticipantFromChatRoom(@PathVariable String id, @PathVariable String userId) {
        return chatroomService.removeParticipantFromRoom(id, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<?> leaveGroup(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            
            if (userId == null || userId.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("User ID richiesto"));
            }
            
            Optional<Chatroom> chatroomOpt = chatroomService.getRoomById(id);
            if (chatroomOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Chatroom chatroom = chatroomOpt.get();
            
            // Verifica che l'utente sia nel gruppo
            if (!chatroom.getParticipantIds().contains(userId)) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Utente non nel gruppo"));
            }
            
            // Rimuovi utente
            chatroom.getParticipantIds().remove(userId);
            
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
    

    
}