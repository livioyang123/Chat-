package com.chat.demo.data.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chatrooms")
public class Chatroom {
    @Id
    private String id;
    private String name;
    private String description;
    private Set<String> participantIds; 
}