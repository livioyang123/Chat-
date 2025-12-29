package com.chat.demo.config.videoCall;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "videocall")
public class VideoCallProperties {
    
    private int maxParticipants = 8;
    private int callTimeoutMinutes = 60;
    private boolean enableRecording = false;
    private String stunServer = "stun:stun.l.google.com:19302";
    private String[] turnServers = {};
    
    // Getters and Setters
    public int getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(int maxParticipants) { this.maxParticipants = maxParticipants; }
    
    public int getCallTimeoutMinutes() { return callTimeoutMinutes; }
    public void setCallTimeoutMinutes(int callTimeoutMinutes) { this.callTimeoutMinutes = callTimeoutMinutes; }
    
    public boolean isEnableRecording() { return enableRecording; }
    public void setEnableRecording(boolean enableRecording) { this.enableRecording = enableRecording; }
    
    public String getStunServer() { return stunServer; }
    public void setStunServer(String stunServer) { this.stunServer = stunServer; }
    
    public String[] getTurnServers() { return turnServers; }
    public void setTurnServers(String[] turnServers) { this.turnServers = turnServers; }
}