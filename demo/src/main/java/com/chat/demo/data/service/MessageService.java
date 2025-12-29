package com.chat.demo.data.service;

import com.chat.demo.data.entity.Message;
import com.chat.demo.data.repo.MessageRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepo messageRepository;

    public Message saveMessage(Message message) {
        Message m = new Message(message);
        m.setTimestamp(LocalDateTime.now());
        return messageRepository.save(m);
    }

    public List<Message> getMessagesByRoom(String roomId) {
        return messageRepository.findByChatRoomIdOrderByTimestampAsc(roomId);
    }

    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    public Optional<Message> getMessageById(String id) {
        return messageRepository.findById(id);
    }

    public List<Message> getMessagesByChatRoomId(String chatRoomId) {
        return messageRepository.findByChatRoomId(chatRoomId);
    }

    public void deleteMessageById(String id) {
        messageRepository.deleteById(id);
    }

}