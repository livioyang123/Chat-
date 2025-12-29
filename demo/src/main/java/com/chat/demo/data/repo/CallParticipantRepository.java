package com.chat.demo.data.repo;
// CallParticipantRepository.java

import com.chat.demo.data.entity.CallParticipant;
import com.chat.demo.data.dto.ParticipantStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CallParticipantRepository extends MongoRepository<CallParticipant, String> {
    
    // Trova partecipante per chiamata e utente
    Optional<CallParticipant> findByCallIdAndUserId(String callId, String userId);
    
    // Trova tutti i partecipanti di una chiamata
    List<CallParticipant> findByCallId(String callId);
    
    // Trova partecipanti per stato
    List<CallParticipant> findByCallIdAndStatus(String callId, ParticipantStatus status);
    
    // CORREZIONE 6: Query per partecipanti attivi (JOINED)
    @Query("{ $and: [ " +
           "  { 'callId': ?0 }, " +
           "  { 'status': 'JOINED' } " +
           "] }")
    List<CallParticipant> findActiveParticipantsByCallId(String callId);
    
    // CORREZIONE 7: Query per partecipanti che hanno accettato ma non sono ancora uniti
    @Query("{ $and: [ " +
           "  { 'callId': ?0 }, " +
           "  { 'status': { $in: ['INVITED', 'JOINED'] } } " +
           "] }")
    List<CallParticipant> findInvitedOrJoinedParticipants(String callId);
    
    // Trova partecipanti per utente (tutte le chiamate)
    List<CallParticipant> findByUserId(String userId);
    
    // CORREZIONE 8: Query per partecipanti attivi per un utente
    @Query("{ $and: [ " +
           "  { 'userId': ?0 }, " +
           "  { 'status': 'JOINED' } " +
           "] }")
    List<CallParticipant> findActiveParticipantsByUserId(String userId);
    
    // Elimina partecipanti per chiamata
    void deleteByCallId(String callId);
    
    // CORREZIONE 9: Query per partecipanti collegati dopo una certa data
    @Query("{ $and: [ " +
           "  { 'callId': ?0 }, " +
           "  { 'joinedAt': { $gte: ?1 } }, " +
           "  { 'status': 'JOINED' } " +
           "] }")
    List<CallParticipant> findRecentlyJoinedParticipants(String callId, LocalDateTime since);
    
    // CORREZIONE 10: Query per trovare partecipanti con peer ID specifico
    Optional<CallParticipant> findByCallIdAndPeerId(String callId, String peerId);
    
    // Conta partecipanti per stato
    long countByCallIdAndStatus(String callId, ParticipantStatus status);
    
    // CORREZIONE 11: Query per partecipanti che potrebbero essere orfani
    @Query("{ $and: [ " +
           "  { 'status': 'JOINED' }, " +
           "  { 'joinedAt': { $lt: ?0 } }, " +
           "  { 'leftAt': { $exists: false } } " +
           "] }")
    List<CallParticipant> findPotentialOrphanedParticipants(LocalDateTime cutoffTime);
}