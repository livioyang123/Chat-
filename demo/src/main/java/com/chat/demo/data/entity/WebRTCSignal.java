package com.chat.demo.data.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class WebRTCSignal {
    private String type; // offer, answer, ice-candidate
    private String callId;
    private String fromUserId;
    private String toUserId;
    private Object data; // SDP or ICE candidate data
    private String peerId;

    // Constructors
    public WebRTCSignal() {}

    public WebRTCSignal(String type, String callId, String fromUserId, String toUserId, Object data) {
        this.type = type;
        this.callId = callId;
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.data = data;
    }

    // Getters and Setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCallId() { return callId; }
    public void setCallId(String callId) { this.callId = callId; }

    public String getFromUserId() { return fromUserId; }
    public void setFromUserId(String fromUserId) { this.fromUserId = fromUserId; }

    public String getToUserId() { return toUserId; }
    public void setToUserId(String toUserId) { this.toUserId = toUserId; }

    public Object getData() { return data; }
    public void setData(Object data) { this.data = data; }

    public String getPeerId() { return peerId; }
    public void setPeerId(String peerId) { this.peerId = peerId; }
}
