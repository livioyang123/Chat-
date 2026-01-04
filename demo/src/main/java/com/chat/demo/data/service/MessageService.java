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
    private final RedisCacheService redisCacheService; // ✨ NUOVO

    public Message saveMessage(Message message) {
        Message m = new Message(message);
        m.setTimestamp(LocalDateTime.now());
        Message savedMessage = messageRepository.save(m);
        try {
            redisCacheService.refreshChatMessagesCache(savedMessage.getChatRoomId());
        } catch (Exception e) {
            // TODO: handle exception
            System.err.println("⚠️ Redis refresh failed: " + e.getMessage());
        }
        return savedMessage;
    }

    public List<Message> getMessagesByRoom(String roomId) {
        return redisCacheService.getChatMessages(roomId);
    }

    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    public List<Message> getMessageById(String id) {
        return redisCacheService.getMessagesById(id);
    }

    public List<Message> getMessagesByChatRoomId(String chatRoomId) {
        return messageRepository.findByChatRoomId(chatRoomId);
    }

    public void deleteMessageById(String id) {
        messageRepository.deleteById(id);
    }

}