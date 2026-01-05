package com.chat.demo.controller;

import com.chat.demo.data.entity.Chatroom;
import com.chat.demo.data.service.ChatroomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


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

    

    
}