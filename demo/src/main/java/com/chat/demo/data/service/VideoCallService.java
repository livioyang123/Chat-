package com.chat.demo.data.service;

import com.chat.demo.data.entity.CallParticipant;
import com.chat.demo.data.entity.VideoCall;
import com.chat.demo.data.entity.Message;
import com.chat.demo.data.dto.VideoCallType;
import com.chat.demo.data.dto.VideoCallStatus;
import com.chat.demo.data.dto.ParticipantStatus;
import com.chat.demo.data.repo.VideoCallRepository;
import com.chat.demo.data.repo.CallParticipantRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.HashMap;
import java.util.Map;

@Service
public class VideoCallService {

    private static final Logger logger = LoggerFactory.getLogger(VideoCallService.class);

    @Autowired
    private VideoCallRepository videoCallRepository;
    
    @Autowired
    private CallParticipantRepository callParticipantRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;

    // CORREZIONE PRINCIPALE: Fix del problema di routing degli inviti
    @Transactional
    public VideoCall initiateCall(String initiatorId, List<String> participantIds, VideoCallType type) {
        logger.info("=== INITIATING CALL ===");
        logger.info("Initiator: {}, Participants: {}, Type: {}", initiatorId, participantIds, type);
        
        // CORREZIONE 1: Verifica chiamate attive esistenti con controllo più rigoroso
        List<String> allUsers = new java.util.ArrayList<>(participantIds);
        allUsers.add(initiatorId);
        
        for (String userId : allUsers) {
            List<VideoCall> existingCalls = videoCallRepository.findActiveCallsForUser(userId);
            if (!existingCalls.isEmpty()) {
                logger.error("User {} is already in an active call: {}", userId, existingCalls.get(0).getId());
                throw new RuntimeException("User " + userId + " is already in an active call");
            }
        }
        
        // CORREZIONE 2: Genera roomId basato sulla chat, non sulla chiamata
        // Il roomId dovrebbe essere il chatId passato dal frontend
        String roomId = generateRoomIdFromParticipants(allUsers);
        
        VideoCall call = new VideoCall(initiatorId, participantIds, type);
        call.setStatus(VideoCallStatus.INITIATED);
        call.setStartTime(LocalDateTime.now());
        call.setRoomId(roomId); // Questo ora corrisponde al chatId
        
        VideoCall savedCall = videoCallRepository.save(call);
        logger.info("Call saved with ID: {} and roomId: {}", savedCall.getId(), savedCall.getRoomId());
        
        // Crea partecipanti
        for (String participantId : participantIds) {
            CallParticipant participant = new CallParticipant(savedCall.getId(), participantId);
            participant.setStatus(ParticipantStatus.INVITED);
            callParticipantRepository.save(participant);
            logger.info("Participant created: {} for call: {}", participantId, savedCall.getId());
        }
        
        logger.info("Call initiated successfully: {}", savedCall.getId());
        return savedCall;
    }

    // CORREZIONE 3: Genera roomId consistente basato sui partecipanti
    private String generateRoomIdFromParticipants(List<String> participants) {
        // Ordina i partecipanti per avere un ID consistente
        List<String> sortedParticipants = new java.util.ArrayList<>(participants);
        sortedParticipants.sort(String::compareTo);
        
        // Crea un hash basato sui partecipanti
        String participantsString = String.join("_", sortedParticipants);
        return "chat_" + Math.abs(participantsString.hashCode());
    }

    @Transactional
    public CallParticipant joinCall(String callId, String userId, String peerId) {
        logger.info("=== USER JOINING CALL ===");
        logger.info("User: {}, Call: {}, PeerId: {}", userId, callId, peerId);
        
        // Verifica che la chiamata esista ed sia attiva
        VideoCall call = getCallDetails(callId);
        if (call.getStatus() == VideoCallStatus.ENDED) {
            logger.error("Cannot join ended call: {}", callId);
            throw new RuntimeException("Cannot join ended call");
        }
        
        // CORREZIONE 4: Verifica che l'utente sia nei partecipanti invitati
        if (!call.getParticipantIds().contains(userId)) {
            logger.error("User {} not invited to call {}", userId, callId);
            throw new RuntimeException("User not invited to this call");
        }
        
        // Trova o crea il partecipante
        Optional<CallParticipant> existingParticipant = callParticipantRepository
            .findByCallIdAndUserId(callId, userId);
        
        CallParticipant participant;
        if (existingParticipant.isPresent()) {
            participant = existingParticipant.get();
            if (participant.getStatus() == ParticipantStatus.JOINED) {
                logger.warn("User {} already joined call {}", userId, callId);
                return participant; // Già nella chiamata
            }
            participant.setStatus(ParticipantStatus.JOINED);
            participant.setJoinedAt(LocalDateTime.now());
            participant.setPeerId(peerId);
        } else {
            participant = new CallParticipant(callId, userId);
            participant.setStatus(ParticipantStatus.JOINED);
            participant.setJoinedAt(LocalDateTime.now());
            participant.setPeerId(peerId);
        }
        
        CallParticipant savedParticipant = callParticipantRepository.save(participant);
        logger.info("Participant saved: {}", savedParticipant.getId());
        
        // Aggiorna stato chiamata
        if (call.getStatus() == VideoCallStatus.INITIATED) {
            call.setStatus(VideoCallStatus.ONGOING);
            videoCallRepository.save(call);
            logger.info("Call status updated to ONGOING: {}", callId);
        }
        
        // CORREZIONE 5: Invia evento con dati corretti del partecipante
        sendCallEvent(callId, "participant-joined", savedParticipant, call.getRoomId());
        
        logger.info("User {} successfully joined call {}", userId, callId);
        return savedParticipant;
    }

    @Transactional
    public void leaveCall(String callId, String userId) {
        logger.info("=== USER LEAVING CALL ===");
        logger.info("User: {}, Call: {}", userId, callId);
        
        VideoCall call = getCallDetails(callId);
        Optional<CallParticipant> participantOpt = callParticipantRepository
            .findByCallIdAndUserId(callId, userId);
        
        if (participantOpt.isPresent()) {
            CallParticipant participant = participantOpt.get();
            participant.setStatus(ParticipantStatus.LEFT);
            participant.setLeftAt(LocalDateTime.now());
            callParticipantRepository.save(participant);
            
            logger.info("Participant {} marked as LEFT", userId);
            
            // Invia evento
            sendCallEvent(callId, "participant-left", participant, call.getRoomId());
            
            // CORREZIONE 6: Controlla se terminare automaticamente la chiamata
            List<CallParticipant> activeParticipants = callParticipantRepository
                .findActiveParticipantsByCallId(callId);
            
            logger.info("Active participants remaining: {}", activeParticipants.size());
            
            if (activeParticipants.isEmpty() || 
                (activeParticipants.size() == 1 && activeParticipants.get(0).getUserId().equals(call.getInitiatorId()))) {
                logger.info("No participants left or only initiator remaining, ending call: {}", callId);
                endCallInternal(callId, call);
            }
        } else {
            logger.warn("Participant {} not found in call {}", userId, callId);
        }
        
        logger.info("User {} left call {}", userId, callId);
    }

    @Transactional
    public void endCall(String callId, String userId) {
        logger.info("=== ENDING CALL ===");
        logger.info("User: {}, Call: {}", userId, callId);
        
        VideoCall call = getCallDetails(callId);
        
        // CORREZIONE 7: Permetti a qualsiasi partecipante attivo di terminare la chiamata
        // Non solo l'initiator, per gestire meglio i casi di disconnessione
        List<CallParticipant> activeParticipants = callParticipantRepository
            .findActiveParticipantsByCallId(callId);
        
        boolean userCanEndCall = call.getInitiatorId().equals(userId) || 
                                activeParticipants.stream().anyMatch(p -> p.getUserId().equals(userId));
        
        if (!userCanEndCall) {
            logger.error("User {} cannot end call {}", userId, callId);
            throw new RuntimeException("User not authorized to end this call");
        }
        
        endCallInternal(callId, call);
        logger.info("Call {} ended by {}", callId, userId);
    }

    private void endCallInternal(String callId, VideoCall call) {
        logger.info("=== ENDING CALL INTERNAL ===");
        logger.info("Call: {}", callId);
        
        // Aggiorna stato chiamata
        call.setStatus(VideoCallStatus.ENDED);
        call.setEndTime(LocalDateTime.now());
        videoCallRepository.save(call);
        logger.info("Call status updated to ENDED");
        
        // Aggiorna tutti i partecipanti attivi
        List<CallParticipant> activeParticipants = callParticipantRepository
            .findActiveParticipantsByCallId(callId);
        
        logger.info("Updating {} active participants to LEFT status", activeParticipants.size());
        
        for (CallParticipant participant : activeParticipants) {
            participant.setStatus(ParticipantStatus.LEFT);
            participant.setLeftAt(LocalDateTime.now());
            callParticipantRepository.save(participant);
            logger.info("Participant {} updated to LEFT", participant.getUserId());
        }
        
        // Invia evento di fine chiamata
        sendCallEvent(callId, "call-ended", null, call.getRoomId());
        logger.info("Call-ended event sent for call: {}", callId);
    }

    public void declineCall(String callId, String userId) {
        logger.info("=== USER DECLINING CALL ===");
        logger.info("User: {}, Call: {}", userId, callId);
        
        Optional<CallParticipant> participantOpt = callParticipantRepository
            .findByCallIdAndUserId(callId, userId);
        
        if (participantOpt.isPresent()) {
            CallParticipant participant = participantOpt.get();
            participant.setStatus(ParticipantStatus.DECLINED);
            callParticipantRepository.save(participant);
            
            VideoCall call = getCallDetails(callId);
            sendCallEvent(callId, "participant-declined", participant, call.getRoomId());
            logger.info("User {} declined call {}", userId, callId);
        } else {
            logger.warn("Participant {} not found for decline in call {}", userId, callId);
        }
    }

    public CallParticipant updateParticipantMedia(String callId, String userId, 
                                                 boolean isMuted, boolean isVideoEnabled) {
        logger.info("=== UPDATING MEDIA STATE ===");
        logger.info("User: {}, Call: {}, Muted: {}, Video: {}", userId, callId, isMuted, isVideoEnabled);
        
        Optional<CallParticipant> participantOpt = callParticipantRepository
            .findByCallIdAndUserId(callId, userId);
        
        if (participantOpt.isPresent()) {
            CallParticipant participant = participantOpt.get();
            participant.setMuted(isMuted);
            participant.setVideoEnabled(isVideoEnabled);
            CallParticipant saved = callParticipantRepository.save(participant);
            
            VideoCall call = getCallDetails(callId);
            sendCallEvent(callId, "media-updated", saved, call.getRoomId());
            
            logger.info("Media state updated for user {} in call {}", userId, callId);
            return saved;
        }
        
        throw new RuntimeException("Participant not found in call");
    }

    // CORREZIONE 8: Metodo migliorato per inviare eventi di chiamata
    private void sendCallEvent(String callId, String eventType, Object data, String roomId) {
        logger.info("=== SENDING CALL EVENT ===");
        logger.info("Type: {}, Call: {}, RoomId: {}", eventType, callId, roomId);
        
        try {
            // Crea il payload dell'evento
            Map<String, Object> eventData = new HashMap<>();
            eventData.put("type", eventType);
            eventData.put("callId", callId);
            eventData.put("timestamp", LocalDateTime.now().toString());
            
            if (data != null) {
                if (data instanceof CallParticipant) {
                    CallParticipant participant = (CallParticipant) data;
                    Map<String, Object> participantData = new HashMap<>();
                    participantData.put("userId", participant.getUserId());
                    participantData.put("peerId", participant.getPeerId());
                    participantData.put("status", participant.getStatus().toString());
                    participantData.put("isMuted", participant.isMuted());
                    participantData.put("isVideoEnabled", participant.isVideoEnabled());
                    eventData.put("data", participantData);
                } else {
                    eventData.put("data", data);
                }
            }
            
            String eventContent = objectMapper.writeValueAsString(eventData);
            
            Message eventMessage = new Message();
            eventMessage.setId(UUID.randomUUID().toString());
            eventMessage.setSenderId("SYSTEM");
            eventMessage.setChatRoomId(roomId); // CORREZIONE: Usa il roomId corretto che corrisponde al chatId
            eventMessage.setContent(eventContent);
            eventMessage.setType(Message.MessageType.CALL_EVENT);
            eventMessage.setTimestamp(LocalDateTime.now());
            
            // CORREZIONE: Invia solo al topic generale della chat
            messagingTemplate.convertAndSend(
                "/topic/chatroom/" + roomId, 
                eventMessage
            );
            
            logger.info("Call event sent successfully to /topic/chatroom/{}", roomId);
            
        } catch (Exception e) {
            logger.error("Error sending call event", e);
        }
    }

    public List<VideoCall> getActiveCallsForUser(String userId) {
        return videoCallRepository.findActiveCallsForUser(userId);
    }

    public VideoCall getCallDetails(String callId) {
        return videoCallRepository.findById(callId)
            .orElseThrow(() -> new RuntimeException("Call not found: " + callId));
    }

    public List<CallParticipant> getCallParticipants(String callId) {
        return callParticipantRepository.findByCallId(callId);
    }

    // CORREZIONE 9: Cleanup automatico delle chiamate orfane con @Scheduled
    @Scheduled(fixedRate = 60000) // Ogni minuto
    @Transactional
    public void cleanupOrphanedCalls() {
        logger.debug("Running cleanup of orphaned calls");
        
        try {
            List<VideoCall> ongoingCalls = videoCallRepository.findByStatus(VideoCallStatus.ONGOING);
            List<VideoCall> initiatedCalls = videoCallRepository.findByStatus(VideoCallStatus.INITIATED);
            
            LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(10); // 10 minuti di timeout
            
            // Cleanup chiamate ONGOING senza partecipanti attivi
            for (VideoCall call : ongoingCalls) {
                List<CallParticipant> activeParticipants = callParticipantRepository
                    .findActiveParticipantsByCallId(call.getId());
                
                if (activeParticipants.isEmpty() && call.getUpdatedAt().isBefore(cutoffTime)) {
                    logger.info("Cleaning up orphaned ONGOING call: {}", call.getId());
                    endCallInternal(call.getId(), call);
                }
            }
            
            // Cleanup chiamate INITIATED che non sono mai iniziate
            for (VideoCall call : initiatedCalls) {
                if (call.getStartTime().isBefore(cutoffTime)) {
                    logger.info("Cleaning up stale INITIATED call: {}", call.getId());
                    endCallInternal(call.getId(), call);
                }
            }
            
        } catch (Exception e) {
            logger.error("Error during cleanup", e);
        }
    }

    // CORREZIONE 10: Metodo per forzare cleanup di un utente
    @Transactional
    public void forceCleanupUserCalls(String userId) {
        logger.info("=== FORCE CLEANUP USER CALLS ===");
        logger.info("User: {}", userId);
        
        List<VideoCall> activeCalls = videoCallRepository.findActiveCallsForUser(userId);
        
        for (VideoCall call : activeCalls) {
            logger.info("Force cleaning call {} for user {}", call.getId(), userId);
            
            // Marca l'utente come LEFT
            Optional<CallParticipant> participantOpt = callParticipantRepository
                .findByCallIdAndUserId(call.getId(), userId);
            
            if (participantOpt.isPresent()) {
                CallParticipant participant = participantOpt.get();
                participant.setStatus(ParticipantStatus.LEFT);
                participant.setLeftAt(LocalDateTime.now());
                callParticipantRepository.save(participant);
                
                sendCallEvent(call.getId(), "participant-left", participant, call.getRoomId());
            }
            
            // Controlla se terminare la chiamata
            List<CallParticipant> remainingParticipants = callParticipantRepository
                .findActiveParticipantsByCallId(call.getId());
            
            if (remainingParticipants.isEmpty()) {
                logger.info("No participants remaining, ending call: {}", call.getId());
                endCallInternal(call.getId(), call);
            }
        }
    }

    // CORREZIONE 11: Metodo per ottenere stato chiamata con dettagli
    public Map<String, Object> getCallStatus(String callId) {
        VideoCall call = getCallDetails(callId);
        List<CallParticipant> participants = getCallParticipants(callId);
        
        Map<String, Object> status = new HashMap<>();
        status.put("call", call);
        status.put("participants", participants);
        status.put("activeParticipants", participants.stream()
            .filter(p -> p.getStatus() == ParticipantStatus.JOINED)
            .count());
        status.put("totalParticipants", participants.size());
        
        return status;
    }

    // CORREZIONE 12: Metodo per verificare se un utente può unirsi
    public boolean canUserJoinCall(String callId, String userId) {
        try {
            VideoCall call = getCallDetails(callId);
            
            // Verifica stato chiamata
            if (call.getStatus() == VideoCallStatus.ENDED) {
                return false;
            }
            
            // Verifica che l'utente sia invitato
            if (!call.getParticipantIds().contains(userId)) {
                return false;
            }
            
            // Verifica che l'utente non sia già in altra chiamata
            List<VideoCall> activeCalls = videoCallRepository.findActiveCallsForUser(userId);
            return activeCalls.isEmpty() || activeCalls.stream().anyMatch(c -> c.getId().equals(callId));
            
        } catch (Exception e) {
            logger.error("Error checking if user can join call", e);
            return false;
        }
    }

    // AGGIUNTA: Metodo per ottenere statistiche delle chiamate
    public Map<String, Object> getCallStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            long totalCalls = videoCallRepository.count();
            long ongoingCalls = videoCallRepository.countByStatus(VideoCallStatus.ONGOING);
            long endedCalls = videoCallRepository.countByStatus(VideoCallStatus.ENDED);
            
            stats.put("total", totalCalls);
            stats.put("ongoing", ongoingCalls);
            stats.put("ended", endedCalls);
            stats.put("initiated", videoCallRepository.countByStatus(VideoCallStatus.INITIATED));
            
        } catch (Exception e) {
            logger.error("Error getting call statistics", e);
        }
        
        return stats;
    }
}