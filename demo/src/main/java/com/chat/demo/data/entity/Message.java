package com.chat.demo.data.entity;
import java.time.LocalDateTime; 
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "messages")
public class Message {
    @Id
    private String id;
    private String chatRoomId;
    private String senderId;
    private String recipientId; // Optional, for direct messages
    private String content;
    private LocalDateTime timestamp = LocalDateTime.now();
    private MessageType type;

    private String fileUrl;
    private String fileName;

    public enum MessageType {
        VIDEO,
        IMAGE,
        CHAT,           // Messaggio di chat normale
        JOIN,           // Utente si è unito
        LEAVE,          // Utente ha lasciato
        WEBRTC_SIGNAL,  // Segnali WebRTC (offer, answer, ice-candidate)
        CALL_INVITATION,// Invito a una chiamata
        CALL_EVENT      // Eventi della chiamata (joined, left, ended)
    }

    public Message(Message message) {
        this.id = message.id;
        this.chatRoomId = message.chatRoomId;
        this.content = message.content;
        this.timestamp = message.timestamp;
        this.type = message.type;
        this.senderId = message.senderId;
        this.fileUrl = message.fileUrl;
        this.fileName = message.fileName;
    }
    
    // Metodo helper per verificare se il messaggio ha un file
    public boolean hasFile() {
        return fileUrl != null && fileUrl.trim().length() != 0;
    }
    
    // Metodo helper per verificare se è solo un file (senza testo)
    public boolean isFileOnly() {
        return hasFile() && (content == null || content.trim().isEmpty());
    }
}
