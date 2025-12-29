// services/videoCallService.ts
import { ApiService } from '../api';
import type { 
  VideoCall, 
  CallParticipant, 
  InitiateCallRequest, 
} from '@/types/videoApi';

import type { ApiResponse } from '@/types/api';

export class VideoCallService {
  
  // Inizia una nuova chiamata
  static async initiateCall(request: InitiateCallRequest): Promise<VideoCall> {
    try {
      const response = await ApiService.post<ApiResponse<VideoCall>>(
        '/api/video-calls/initiate', // Fixed: added leading slash
        request
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to initiate call');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in initiateCall:', error);
      throw error;
    }
  }

  // Partecipa a una chiamata
  static async joinCall(callId: string, userId: string, peerId: string): Promise<CallParticipant> {
    try {
      const response = await ApiService.post<ApiResponse<CallParticipant>>(
        `/api/video-calls/${callId}/join`, // Fixed: added /api prefix
        { userId, peerId }
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to join call');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in joinCall:', error);
      throw error;
    }
  }

  // Lascia una chiamata
  static async leaveCall(callId: string, userId: string): Promise<void> {
    try {
      const response = await ApiService.post<ApiResponse<void>>(
        `/api/video-calls/${callId}/leave`, // Fixed: added /api prefix
        { userId }
      );
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to leave call');
      }
    } catch (error) {
      console.error('Error in leaveCall:', error);
      throw error;
    }
  }

  // Termina una chiamata
  static async endCall(callId: string, userId: string): Promise<void> {
    try {
      const response = await ApiService.post<ApiResponse<void>>(
        `/api/video-calls/${callId}/end`, // Fixed: added /api prefix
        { userId }
      );
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to end call');
      }
    } catch (error) {
      console.error('Error in endCall:', error);
      throw error;
    }
  }

  // Rifiuta una chiamata
  static async declineCall(callId: string, userId: string): Promise<void> {
    try {
      const response = await ApiService.post<ApiResponse<void>>(
        `/api/video-calls/${callId}/decline`, // Fixed: added /api prefix
        { userId }
      );
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to decline call');
      }
    } catch (error) {
      console.error('Error in declineCall:', error);
      throw error;
    }
  }

  // Aggiorna stato media
  static async updateMediaState(
    callId: string, 
    userId: string, 
    isMuted: boolean, 
    isVideoEnabled: boolean
  ): Promise<CallParticipant> {
    try {
      const response = await ApiService.put<ApiResponse<CallParticipant>>(
        `/api/video-calls/${callId}/media`, // Fixed: added /api prefix
        { userId, isMuted, isVideoEnabled }
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update media state');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in updateMediaState:', error);
      throw error;
    }
  }

  // Ottieni chiamate attive
  static async getActiveCallsForUser(userId: string): Promise<VideoCall[]> {
    try {
      const response = await ApiService.get<ApiResponse<VideoCall[]>>(
        `/api/video-calls/active/${userId}` // Fixed: added /api prefix
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get active calls');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in getActiveCallsForUser:', error);
      throw error;
    }
  }

  // Ottieni dettagli chiamata
  static async getCallDetails(callId: string): Promise<VideoCall> {
    try {
      const response = await ApiService.get<ApiResponse<VideoCall>>(
        `/api/video-calls/${callId}` // Fixed: added /api prefix
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get call details');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in getCallDetails:', error);
      throw error;
    }
  }

  // Ottieni partecipanti chiamata
  static async getCallParticipants(callId: string): Promise<CallParticipant[]> {
    try {
      const response = await ApiService.get<ApiResponse<CallParticipant[]>>(
        `/api/video-calls/${callId}/participants` // Fixed: added /api prefix
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get call participants');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in getCallParticipants:', error);
      throw error;
    }
  }
}