package com.chat.demo.data.service;

import com.chat.demo.data.entity.Chatroom;
import com.chat.demo.data.repo.ChatroomRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatroomService {

    private final ChatroomRepo chatroomRepository;

    public Chatroom createRoom(Chatroom chatroom) {
        return chatroomRepository.save(chatroom);
    }

    public List<Chatroom> getAllRooms() {
        return chatroomRepository.findAll();
    }

    public Optional<Chatroom> getRoomById(String id) {
        return chatroomRepository.findById(id);
    }

    public Optional<Chatroom> getRoomByName(String name) {
        return chatroomRepository.findByName(name);
    }

    public void deleteRoomById(String id) {
        chatroomRepository.deleteById(id);
    }

    public List<Chatroom> getRoomsByParticipantId(String userId) {
        return chatroomRepository.findByParticipantIdsContaining(userId);
    }

    public Optional<Chatroom> addParticipantToRoom(String roomId, String userId) {
        Optional<Chatroom> chatroomOpt = chatroomRepository.findById(roomId);
        if (chatroomOpt.isPresent()) {
            Chatroom chatroom = chatroomOpt.get();
            if (!chatroom.getParticipantIds().contains(userId)) {
                chatroom.getParticipantIds().add(userId);
                return Optional.of(chatroomRepository.save(chatroom));
            }
        }
        return Optional.empty();
    }
}
