package com.chat.demo.data.service;
import com.chat.demo.data.entity.CallParticipant;
import com.chat.demo.data.entity.VideoCall;
import com.chat.demo.data.repo.CallParticipantRepository;
import com.chat.demo.data.repo.VideoCallRepository;
import com.chat.demo.data.entity.WebRTCSignal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WebRTCSignalingService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private VideoCallRepository videoCallRepository;

    @Autowired
    private CallParticipantRepository participantRepository;

    // Gestisce segnali WebRTC (offer, answer, ice-candidate)
    public void handleSignal(WebRTCSignal signal) {
        VideoCall call = videoCallRepository.findById(signal.getCallId())
            .orElseThrow(() -> new RuntimeException("Call not found"));

        // Verifica che i partecipanti siano validi
        boolean fromParticipantValid = participantRepository.findByCallIdAndUserId(
            signal.getCallId(), signal.getFromUserId()
        ).isPresent();

        boolean toParticipantValid = participantRepository.findByCallIdAndUserId(
            signal.getCallId(), signal.getToUserId()
        ).isPresent();

        if (!fromParticipantValid || !toParticipantValid) {
            throw new RuntimeException("Invalid participants for signaling");
        }

        // Inoltra il segnale al destinatario
        messagingTemplate.convertAndSendToUser(
            signal.getToUserId(),
            "/topic/webrtc-signal",
            signal
        );
    }

    // Gestisce segnali broadcast per chiamate di gruppo
    public void handleGroupSignal(WebRTCSignal signal) {
        VideoCall call = videoCallRepository.findById(signal.getCallId())
            .orElseThrow(() -> new RuntimeException("Call not found"));

        // Verifica che il mittente sia un partecipante valido
        boolean fromParticipantValid = participantRepository.findByCallIdAndUserId(
            signal.getCallId(), signal.getFromUserId()
        ).isPresent();

        if (!fromParticipantValid) {
            throw new RuntimeException("Invalid participant for group signaling");
        }

        // Inoltra a tutti gli altri partecipanti attivi
        List<CallParticipant> activeParticipants = participantRepository.findByCallIdAndStatus(
            signal.getCallId(), com.chat.demo.data.dto.ParticipantStatus.JOINED
        );

        for (CallParticipant participant : activeParticipants) {
            if (!participant.getUserId().equals(signal.getFromUserId())) {
                WebRTCSignal forwardSignal = new WebRTCSignal(
                    signal.getType(),
                    signal.getCallId(),
                    signal.getFromUserId(),
                    participant.getUserId(),
                    signal.getData()
                );
                forwardSignal.setPeerId(signal.getPeerId());

                messagingTemplate.convertAndSendToUser(
                    participant.getUserId(),
                    "/topic/webrtc-signal",
                    forwardSignal
                );
            }
        }
    }

    // Notifica connessione peer stabilita
    public void notifyPeerConnected(String callId, String userId, String peerId) {
        VideoCall call = videoCallRepository.findById(callId)
            .orElseThrow(() -> new RuntimeException("Call not found"));

        messagingTemplate.convertAndSend(
            "/topic/call/" + call.getRoomId() + "/peer-connected",
            new PeerConnectionEvent(userId, peerId, "connected")
        );
    }

    // Notifica disconnessione peer
    public void notifyPeerDisconnected(String callId, String userId, String peerId) {
        VideoCall call = videoCallRepository.findById(callId)
            .orElseThrow(() -> new RuntimeException("Call not found"));

        messagingTemplate.convertAndSend(
            "/topic/call/" + call.getRoomId() + "/peer-disconnected",
            new PeerConnectionEvent(userId, peerId, "disconnected")
        );
    }

    // Classe helper per eventi peer connection
    public static class PeerConnectionEvent {
        private String userId;
        private String peerId;
        private String status;

        public PeerConnectionEvent(String userId, String peerId, String status) {
            this.userId = userId;
            this.peerId = peerId;
            this.status = status;
        }

        // Getters
        public String getUserId() { return userId; }
        public String getPeerId() { return peerId; }
        public String getStatus() { return status; }
    }
}