package com.chat.demo.data.repo;

import com.chat.demo.data.entity.Chatroom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ChatroomRepo extends MongoRepository<Chatroom, String> {
    Optional<Chatroom> findByName(String name); // Restituisce Optional
    @Query("{ 'participantIds': { $in: [?0] } }")
    List<Chatroom> findByParticipantIds(String userId);
    List<Chatroom> findByParticipantIdsContaining(String userId);
}