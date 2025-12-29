package com.chat.demo.data.repo;
// VideoCallRepository.java

import com.chat.demo.data.entity.VideoCall;
import com.chat.demo.data.dto.VideoCallStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VideoCallRepository extends MongoRepository<VideoCall, String> {
    
    // CORREZIONE 1: Query per trovare chiamate attive per un utente
    @Query("{ $and: [ " +
           "  { $or: [ " +
           "    { 'initiatorId': ?0 }, " +
           "    { 'participantIds': { $in: [?0] } } " +
           "  ] }, " +
           "  { 'status': { $in: ['INITIATED', 'ONGOING'] } } " +
           "] }")
    List<VideoCall> findActiveCallsForUser(String userId);
    
    // CORREZIONE 2: Query per trovare chiamate attive per una lista di utenti
    @Query("{ $and: [ " +
           "  { $or: [ " +
           "    { 'initiatorId': { $in: ?0 } }, " +
           "    { 'participantIds': { $in: ?0 } } " +
           "  ] }, " +
           "  { 'status': { $in: ['INITIATED', 'ONGOING'] } } " +
           "] }")
    List<VideoCall> findActiveCallsForUsers(List<String> userIds);
    
    // Trova chiamate per stato
    List<VideoCall> findByStatus(VideoCallStatus status);
    
    // Conta chiamate per stato
    long countByStatus(VideoCallStatus status);
    
    // CORREZIONE 3: Query per trovare chiamate per room
    List<VideoCall> findByRoomId(String roomId);
    
    // Query per chiamate create dopo una certa data
    List<VideoCall> findByCreatedAtAfter(LocalDateTime date);
    
    // CORREZIONE 4: Query per trovare chiamate orfane (senza partecipanti attivi)
    @Query("{ $and: [ " +
           "  { 'status': 'ONGOING' }, " +
           "  { 'updatedAt': { $lt: ?0 } } " +
           "] }")
    List<VideoCall> findOrphanedCalls(LocalDateTime cutoffTime);
    
    // Trova chiamate per initiator
    List<VideoCall> findByInitiatorId(String initiatorId);
    
    // CORREZIONE 5: Query per trovare chiamate attive in un range di tempo
    @Query("{ $and: [ " +
           "  { 'status': { $in: ['INITIATED', 'ONGOING'] } }, " +
           "  { 'startTime': { $gte: ?0, $lte: ?1 } } " +
           "] }")
    List<VideoCall> findActiveCallsInTimeRange(LocalDateTime start, LocalDateTime end);
}