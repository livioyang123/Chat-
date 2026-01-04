// src/main/java/com/chat/demo/service/RedisCacheService.java
package com.chat.demo.data.service;

import com.chat.demo.data.entity.Message;
import com.chat.demo.data.entity.User;
import com.chat.demo.data.entity.Chatroom;
import com.chat.demo.data.repo.MessageRepo;
import com.chat.demo.data.repo.UserRepo;
import com.chat.demo.data.repo.ChatroomRepo;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisCacheService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final UserRepo userRepo;
    private final MessageRepo messageRepo;
    private final ChatroomRepo chatroomRepo;
    private final ObjectMapper objectMapper;

    // ==================== USER CACHE ====================
    
    public Optional<User> getUserFromCache(String userId) {
        try {
            String key = "user:" + userId;
            Object cached = redisTemplate.opsForValue().get(key);
            
            if (cached != null) {
                log.debug("✅ User {} found in Redis", userId);
                // ELIMINA dopo lettura (come richiesto)
                redisTemplate.delete(key);
                return Optional.of(objectMapper.convertValue(cached, User.class));
            }
            
            // Fallback a MongoDB
            log.debug("⚠️ User {} not in Redis, fetching from MongoDB", userId);
            Optional<User> userFromDb = userRepo.findById(userId);
            userFromDb.ifPresent(user -> cacheUser(userId, user));
            return userFromDb;
            
        } catch (Exception e) {
            log.error("❌ Redis error for user {}, falling back to MongoDB: {}", 
                     userId, e.getMessage());
            return userRepo.findById(userId);
        }
    }

    public void cacheUser(String userId, User user) {
        try {
            String key = "user:" + userId;
            redisTemplate.opsForValue().set(key, user, 24, TimeUnit.HOURS);
            log.debug("💾 User {} cached in Redis", userId);
        } catch (Exception e) {
            log.error("❌ Failed to cache user {}: {}", userId, e.getMessage());
        }
    }

    public void invalidateUserCache(String userId) {
        try {
            redisTemplate.delete("user:" + userId);
            log.debug("🗑️ User {} cache invalidated", userId);
        } catch (Exception e) {
            log.error("❌ Failed to invalidate user cache: {}", e.getMessage());
        }
    }

    // ==================== CHAT MESSAGES CACHE ====================
    
    public List<Message> getChatMessages(String chatId) {
        try {
            String key = "chat:messages:" + chatId;
            Object cached = redisTemplate.opsForValue().get(key);
            
            if (cached != null) {
                log.debug("✅ Messages for chat {} found in Redis", chatId);
                // NON elimina, ma refresh TTL
                redisTemplate.expire(key, 20, TimeUnit.MINUTES);
                return objectMapper.convertValue(cached, 
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Message.class));
            }
            
            // Fallback a MongoDB
            log.debug("⚠️ Messages for chat {} not in Redis, fetching from MongoDB", chatId);
            List<Message> messages = messageRepo.findByChatRoomIdOrderByTimestampAsc(chatId);
            cacheChatMessages(chatId, messages);
            return messages;
            
        } catch (Exception e) {
            log.error("❌ Redis error for chat {}, falling back to MongoDB: {}", 
                     chatId, e.getMessage());
            return messageRepo.findByChatRoomIdOrderByTimestampAsc(chatId);
        }
    }

    public List<Message> getMessagesById(String id) {
        try {
            String key = "message:" + id;
            Object cached = redisTemplate.opsForValue().get(key);
            
            if (cached != null) {
                log.debug("✅ Message {} found in Redis", id);
                return objectMapper.convertValue(cached, 
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Message.class));
            }
            
            // Fallback a MongoDB
            log.debug("⚠️ Message {} not in Redis, fetching from MongoDB", id);
            List<Message> messages = messageRepo.findById(id).map(List::of).orElse(List.of());
            return messages;
            
        } catch (Exception e) {
            log.error("❌ Redis error for message {}, falling back to MongoDB: {}", 
                     id, e.getMessage());
            return messageRepo.findById(id).map(List::of).orElse(List.of());
        }
    }

    public void cacheChatMessages(String chatId, List<Message> messages) {
        try {
            String key = "chat:messages:" + chatId;
            redisTemplate.opsForValue().set(key, messages, 20, TimeUnit.MINUTES);
            log.debug("💾 Messages for chat {} cached in Redis (TTL: 20min)", chatId);
        } catch (Exception e) {
            log.error("❌ Failed to cache messages for chat {}: {}", chatId, e.getMessage());
        }
    }

    public void refreshChatMessagesCache(String chatId) {
        try {
            // Ricarica da MongoDB e aggiorna cache
            List<Message> messages = messageRepo.findByChatRoomIdOrderByTimestampAsc(chatId);
            cacheChatMessages(chatId, messages);
            log.debug("🔄 Messages cache refreshed for chat {}", chatId);
        } catch (Exception e) {
            log.error("❌ Failed to refresh messages cache: {}", e.getMessage());
        }
    }

    // ==================== CHATROOM CACHE ====================
    
    public Optional<Chatroom> getChatroomFromCache(String chatroomId) {
        try {
            String key = "chatroom:" + chatroomId;
            Object cached = redisTemplate.opsForValue().get(key);
            
            if (cached != null) {
                log.debug("✅ Chatroom {} found in Redis", chatroomId);
                return Optional.of(objectMapper.convertValue(cached, Chatroom.class));
            }
            
            // Fallback a MongoDB
            log.debug("⚠️ Chatroom {} not in Redis, fetching from MongoDB", chatroomId);
            Optional<Chatroom> chatroomFromDb = chatroomRepo.findById(chatroomId);
            chatroomFromDb.ifPresent(room -> cacheChatroom(chatroomId, room));
            return chatroomFromDb;
            
        } catch (Exception e) {
            log.error("❌ Redis error for chatroom {}, falling back to MongoDB: {}", 
                     chatroomId, e.getMessage());
            return chatroomRepo.findById(chatroomId);
        }
    }

    public void cacheChatroom(String chatroomId, Chatroom chatroom) {
        try {
            String key = "chatroom:" + chatroomId;
            redisTemplate.opsForValue().set(key, chatroom, 15, TimeUnit.MINUTES);
            log.debug("💾 Chatroom {} cached in Redis", chatroomId);
        } catch (Exception e) {
            log.error("❌ Failed to cache chatroom {}: {}", chatroomId, e.getMessage());
        }
    }

    public void invalidateChatroomCache(String chatroomId) {
        try {
            redisTemplate.delete("chatroom:" + chatroomId);
            log.debug("🗑️ Chatroom {} cache invalidated", chatroomId);
        } catch (Exception e) {
            log.error("❌ Failed to invalidate chatroom cache: {}", e.getMessage());
        }
    }
}