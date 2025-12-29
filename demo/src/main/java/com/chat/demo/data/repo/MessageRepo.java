package com.chat.demo.data.repo;

import com.chat.demo.data.entity.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MessageRepo extends MongoRepository<Message, String> {
    List<Message> findByChatRoomId(String chatRoomId); // Corretto il nome del metodo (camelCase)
    
    List<Message> findByChatRoomIdOrderByTimestampAsc(String roomId);
}