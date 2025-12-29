package com.chat.demo.controller;

import com.chat.demo.data.dto.*;
import com.chat.demo.data.entity.CallParticipant;
import com.chat.demo.data.entity.VideoCall;
import com.chat.demo.data.service.VideoCallService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/video-calls")

public class VideoCallController {

    private static final Logger logger = LoggerFactory.getLogger(VideoCallController.class);

    @Autowired
    private VideoCallService videoCallService;

    // Inizia una nuova chiamata
    @PostMapping("/initiate")
    public ResponseEntity<?> initiateCall(@RequestBody InitiateCallRequest request) {
        logger.info("=== INITIATE CALL REQUEST RECEIVED ===");
        logger.info("Request body: {}", request);
        
        try {
            // Validate request
            if (request == null) {
                logger.error("Request is null");
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Request body is null", null));
            }
            
            logger.info("Initiator ID: {}", request.getInitiatorId());
            logger.info("Participant IDs: {}", request.getParticipantIds());
            logger.info("Call Type: {}", request.getType());
            
            // Additional validation
            if (request.getInitiatorId() == null || request.getInitiatorId().trim().isEmpty()) {
                logger.error("Initiator ID is null or empty");
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Initiator ID is required", null));
            }
            
            if (request.getParticipantIds() == null || request.getParticipantIds().isEmpty()) {
                logger.error("Participant IDs are null or empty");
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Participant IDs are required", null));
            }
            
            if (request.getType() == null) {
                logger.error("Call type is null");
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Call type is required", null));
            }
            
            logger.info("Calling videoCallService.initiateCall...");
            VideoCall call = videoCallService.initiateCall(
                request.getInitiatorId(),
                request.getParticipantIds(),
                request.getType()
            );
            
            logger.info("Call created successfully with ID: {}", call.getId());
            
            ApiResponse<VideoCall> response = new ApiResponse<>(true, "Call initiated successfully", call);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error initiating call", e);
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception message: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Internal server error: " + e.getMessage(), null));
        }
    }

    // Partecipa a una chiamata
    @PostMapping("/{callId}/join")
    public ResponseEntity<?> joinCall(
            @PathVariable String callId,
            @RequestBody JoinCallRequest request) {
        logger.info("Join call request - CallId: {}, UserId: {}, PeerId: {}", 
                   callId, request.getUserId(), request.getPeerId());
        try {
            CallParticipant participant = videoCallService.joinCall(
                callId,
                request.getUserId(),
                request.getPeerId()
            );
            return ResponseEntity.ok(new ApiResponse<>(true, "Joined call successfully", participant));
        } catch (Exception e) {
            logger.error("Error joining call", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Lascia una chiamata
    @PostMapping("/{callId}/leave")
    public ResponseEntity<?> leaveCall(
            @PathVariable String callId,
            @RequestBody Map<String, String> request) {
        logger.info("Leave call request - CallId: {}, UserId: {}", callId, request.get("userId"));
        try {
            String userId = request.get("userId");
            if (userId == null || userId.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "User ID is required", null));
            }
            
            videoCallService.leaveCall(callId, userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Left call successfully", null));
        } catch (Exception e) {
            logger.error("Error leaving call", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Termina una chiamata
    @PostMapping("/{callId}/end")
    public ResponseEntity<?> endCall(
            @PathVariable String callId,
            @RequestBody Map<String, String> request) {
        logger.info("End call request - CallId: {}, UserId: {}", callId, request.get("userId"));
        try {
            String userId = request.get("userId");
            if (userId == null || userId.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "User ID is required", null));
            }
            
            videoCallService.endCall(callId, userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Call ended successfully", null));
        } catch (Exception e) {
            logger.error("Error ending call", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Rifiuta una chiamata
    @PostMapping("/{callId}/decline")
    public ResponseEntity<?> declineCall(
            @PathVariable String callId,
            @RequestBody Map<String, String> request) {
        logger.info("Decline call request - CallId: {}, UserId: {}", callId, request.get("userId"));
        try {
            String userId = request.get("userId");
            if (userId == null || userId.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "User ID is required", null));
            }
            
            videoCallService.declineCall(callId, userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Call declined successfully", null));
        } catch (Exception e) {
            logger.error("Error declining call", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Aggiorna stato media (mute/unmute, video on/off)
    @PutMapping("/{callId}/media")
    public ResponseEntity<?> updateMediaState(
            @PathVariable String callId,
            @RequestBody UpdateMediaRequest request) {
        logger.info("Update media state - CallId: {}, UserId: {}, Muted: {}, Video: {}", 
                   callId, request.getUserId(), request.isMuted(), request.isVideoEnabled());
        try {
            CallParticipant participant = videoCallService.updateParticipantMedia(
                callId,
                request.getUserId(),
                request.isMuted(),
                request.isVideoEnabled()
            );
            return ResponseEntity.ok(new ApiResponse<>(true, "Media state updated", participant));
        } catch (Exception e) {
            logger.error("Error updating media state", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Ottieni chiamate attive per un utente
    @GetMapping("/active/{userId}")
    public ResponseEntity<?> getActiveCallsForUser(@PathVariable String userId) {
        logger.info("Get active calls for user: {}", userId);
        try {
            List<VideoCall> activeCalls = videoCallService.getActiveCallsForUser(userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Active calls retrieved", activeCalls));
        } catch (Exception e) {
            logger.error("Error getting active calls", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Ottieni dettagli di una chiamata
    @GetMapping("/{callId}")
    public ResponseEntity<?> getCallDetails(@PathVariable String callId) {
        logger.info("Get call details for: {}", callId);
        try {
            VideoCall call = videoCallService.getCallDetails(callId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Call details retrieved", call));
        } catch (Exception e) {
            logger.error("Error getting call details", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Ottieni partecipanti di una chiamata
    @GetMapping("/{callId}/participants")
    public ResponseEntity<?> getCallParticipants(@PathVariable String callId) {
        logger.info("Get participants for call: {}", callId);
        try {
            List<CallParticipant> participants = videoCallService.getCallParticipants(callId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Participants retrieved", participants));
        } catch (Exception e) {
            logger.error("Error getting call participants", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Classi per le richieste (DTOs)
    public static class InitiateCallRequest {
        private String initiatorId;
        private List<String> participantIds;
        private VideoCallType type;

        // Constructors
        public InitiateCallRequest() {}

        // Getters and Setters
        public String getInitiatorId() { return initiatorId; }
        public void setInitiatorId(String initiatorId) { this.initiatorId = initiatorId; }

        public List<String> getParticipantIds() { return participantIds; }
        public void setParticipantIds(List<String> participantIds) { this.participantIds = participantIds; }

        public VideoCallType getType() { return type; }
        public void setType(VideoCallType type) { this.type = type; }

        @Override
        public String toString() {
            return "InitiateCallRequest{" +
                    "initiatorId='" + initiatorId + '\'' +
                    ", participantIds=" + participantIds +
                    ", type=" + type +
                    '}';
        }
    }

    public static class JoinCallRequest {
        private String userId;
        private String peerId;

        // Constructors
        public JoinCallRequest() {}

        // Getters and Setters
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public String getPeerId() { return peerId; }
        public void setPeerId(String peerId) { this.peerId = peerId; }
    }

    public static class UpdateMediaRequest {
        private String userId;
        private boolean isMuted;
        private boolean isVideoEnabled;

        // Constructors
        public UpdateMediaRequest() {}

        // Getters and Setters
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public boolean isMuted() { return isMuted; }
        public void setMuted(boolean muted) { isMuted = muted; }

        public boolean isVideoEnabled() { return isVideoEnabled; }
        public void setVideoEnabled(boolean videoEnabled) { isVideoEnabled = videoEnabled; }
    }

    // Classe per le risposte API
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;

        public ApiResponse(boolean success, String message, T data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }

        // Getters and Setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public T getData() { return data; }
        public void setData(T data) { this.data = data; }
    }
}