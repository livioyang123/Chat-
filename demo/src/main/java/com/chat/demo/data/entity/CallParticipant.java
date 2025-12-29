package com.chat.demo.data.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

import com.chat.demo.data.dto.ParticipantStatus;

@Document(collection = "call_participants")
public class CallParticipant {
    @Id
    private String id;
    private String callId;
    private String userId;
    private String peerId;
    private ParticipantStatus status;
    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
    private boolean isMuted;
    private boolean isVideoEnabled;

    // Constructors
    public CallParticipant() {}

    public CallParticipant(String callId, String userId) {
        this.callId = callId;
        this.userId = userId;
        this.status = ParticipantStatus.INVITED;
        this.isMuted = false;
        this.isVideoEnabled = true;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCallId() { return callId; }
    public void setCallId(String callId) { this.callId = callId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getPeerId() { return peerId; }
    public void setPeerId(String peerId) { this.peerId = peerId; }

    public ParticipantStatus getStatus() { return status; }
    public void setStatus(ParticipantStatus status) { this.status = status; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }

    public LocalDateTime getLeftAt() { return leftAt; }
    public void setLeftAt(LocalDateTime leftAt) { this.leftAt = leftAt; }

    public boolean isMuted() { return isMuted; }
    public void setMuted(boolean muted) { isMuted = muted; }

    public boolean isVideoEnabled() { return isVideoEnabled; }
    public void setVideoEnabled(boolean videoEnabled) { isVideoEnabled = videoEnabled; }
}