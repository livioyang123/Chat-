package com.chat.demo.data.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

import com.chat.demo.data.dto.VideoCallType;
import com.chat.demo.data.dto.VideoCallStatus;

@Document(collection = "video_calls")
public class VideoCall {
    @Id
    private String id;
    private String initiatorId;
    private List<String> participantIds;
    private String roomId;
    private VideoCallType type;
    private VideoCallStatus status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String sessionId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public VideoCall() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public VideoCall(String initiatorId, List<String> participantIds, VideoCallType type) {
        this();
        this.initiatorId = initiatorId;
        this.participantIds = participantIds;
        this.type = type;
        this.status = VideoCallStatus.INITIATED;
        this.roomId = generateRoomId();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getInitiatorId() { return initiatorId; }
    public void setInitiatorId(String initiatorId) { this.initiatorId = initiatorId; }

    public List<String> getParticipantIds() { return participantIds; }
    public void setParticipantIds(List<String> participantIds) { this.participantIds = participantIds; }

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public VideoCallType getType() { return type; }
    public void setType(VideoCallType type) { this.type = type; }

    public VideoCallStatus getStatus() { return status; }
    public void setStatus(VideoCallStatus status) { 
        this.status = status; 
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    private String generateRoomId() {
        return "room_" + System.currentTimeMillis() + "_" + Math.random();
    }
}
