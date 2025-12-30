import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ApiService } from '@/services/api';
import type { ChatMessage, MessageFilters, ApiResponse } from '@/types/api';
import {UploadResponse} from '@/types/api'

export class MessageService {
  private static stompClient: Client | null = null;
  private static isConnected = false;
  private static subscriptions = new Map<string, () => void>();
  private static connectionCallbacks = new Set<(connected: boolean) => void>();

  // Ottieni messaggi di una chat
  static async getChatMessages(filters: MessageFilters): Promise<Array<ChatMessage>> {
    const { chatId, ...otherFilters } = filters;
    const params = new URLSearchParams();
    
    Object.entries(otherFilters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await ApiService.get<Array<ChatMessage>>(
      `/messages/chatroom/${chatId}?${params.toString()}`
    );
    return response;
  }

  // Elimina un messaggio
  static async deleteMessage(messageId: string): Promise<void> {
    await ApiService.delete(`/messages/${messageId}`);
  }

  // Cerca messaggi
  static async searchMessages(chatId: string, query: string): Promise<ChatMessage[]> {
    const params = new URLSearchParams({ q: query });
    const response = await ApiService.get<ApiResponse<ChatMessage[]>>(
      `/chats/${chatId}/messages/search?${params.toString()}`
    );
    return response.data;
  }

  // Upload file/immagine
  static async uploadFile(file: File, chatId: string): Promise<{ url: string; type: string }> {
    console.log('📁 Starting file upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      chatId: chatId
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('chatId', chatId);

    try {
      const response = await ApiService.post<UploadResponse>(
        'files/upload',
        formData,
        {
          headers: { "Content-Type": 'multipart/form-data' }
        }
      );
      
      console.log('📤 Upload response received:', {
        success: response.success,
        hasData: !!response.data,
        message: response.message
      });

      if (!response.success || !response.data) {
        console.error('❌ Upload failed:', response.message);
        throw new Error(response.message || 'Upload fallito');
      }

      console.log('✅ File uploaded successfully:', {
        url: response.data.url,
        type: response.data.type
      });

      return response.data;
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      throw error instanceof Error ? error : new Error('Errore sconosciuto durante upload');
    }
  }

  static async debugChatMessages(chatId: string): Promise<void> {
    try {
      console.log('🔍 Debugging chat messages for chatId:', chatId);
      
      const messages = await this.getChatMessages({ chatId });
      
      console.log('📊 Chat debug info:', {
        totalMessages: messages.length,
        messageTypes: messages.reduce((acc, msg) => {
          const typeKey = msg.type ?? 'unknown';
          acc[typeKey] = (acc[typeKey] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        messagesWithFiles: messages.filter(msg => msg.fileUrl).length,
        recentMessages: messages.slice(-5).map(msg => ({
          type: msg.type,
          hasFileUrl: !!msg.fileUrl,
          timestamp: msg.timestamp
        }))
      });
      
    } catch (error) {
      console.error('❌ Error debugging chat messages:', error);
    }
  }

  static subscribeToTyping(
    chatId: string,
    onTypingChange: (data: { userId: string; username?: string; isTyping: boolean }) => void
  ): () => void {
    if (!this.stompClient || !this.isConnected) {
      throw new Error('WebSocket non connesso');
    }

    const subscription = this.stompClient.subscribe(
      `/topic/chatroom/${chatId}/typing`,
      (message) => {
        try {
          const data = JSON.parse(message.body);
          onTypingChange(data);
        } catch (error) {
          console.error('Error parsing typing indicator:', error);
        }
      }
    );

    return () => subscription.unsubscribe();
  }

  // Subscribe to online status
  static subscribeToOnlineStatus(
    chatId: string,
    onStatusChange: (data: { userId: string; status: 'online' | 'offline' }) => void
  ): () => void {
    if (!this.stompClient || !this.isConnected) {
      throw new Error('WebSocket non connesso');
    }

    const subscription = this.stompClient.subscribe(
      `/topic/chatroom/${chatId}/status`,
      (message) => {
        try {
          const data = JSON.parse(message.body);
          onStatusChange(data);
        } catch (error) {
          console.error('Error parsing status update:', error);
        }
      }
    );

    return () => subscription.unsubscribe();
  }

  // Send typing indicator
  static sendTypingIndicator(chatId: string, userId: string, isTyping: boolean): void {
    if (!this.stompClient || !this.isConnected) return;

    const username = typeof window !== 'undefined' ? sessionStorage.getItem('currentUser') : null;

    const destination = isTyping ? '/app/chat.typing' : '/app/chat.stopTyping';
    
    this.stompClient.publish({
      destination,
      body: JSON.stringify({
        chatRoomId: chatId,
        userId,
        username
      })
    });
  }

  // Send online status
  static sendOnlineStatus(chatId: string, userId: string, status: 'online' | 'offline'): void {
    if (!this.stompClient || !this.isConnected) return;

    const destination = status === 'online' ? '/app/user.online' : '/app/user.offline';
    
    this.stompClient.publish({
      destination,
      body: JSON.stringify({
        userId,
        chatroomId: chatId
      })
    });
  }

  // ==================== WEBSOCKET METHODS - CORRETTI ====================

  // Inizializza connessione WebSocket
  static initializeWebSocket(serverUrl: string = 'http://localhost:8080/ws-chat'): Promise<void> {
    console.log('🔌 Initializing WebSocket connection to:', serverUrl);
    
    return new Promise((resolve, reject) => {
      if (this.stompClient && this.isConnected) {
        console.log('✅ WebSocket already connected');
        resolve();
        return;
      }

      const socket = new SockJS(serverUrl);
      
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          console.log('🔧 STOMP Debug:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: (frame) => {
          console.log('✅ WebSocket connected successfully');
          console.log('Connection frame:', frame);
          this.isConnected = true;
          this.notifyConnectionCallbacks(true);
          resolve();
        },
        onDisconnect: (frame) => {
          console.log('🔌 WebSocket disconnected');
          console.log('Disconnect frame:', frame);
          this.isConnected = false;
          this.notifyConnectionCallbacks(false);
        },
        onStompError: (frame) => {
          console.error('❌ STOMP Error:', frame);
          this.isConnected = false;
          this.notifyConnectionCallbacks(false);
          reject(new Error(`STOMP Error: ${frame.body}`));
        },
        onWebSocketError: (error) => {
          console.error('❌ WebSocket Error:', error);
          reject(error);
        }
      });

      try {
        this.stompClient.activate();
        console.log('🔄 WebSocket activation initiated');
      } catch (error) {
        console.error('❌ Error activating WebSocket:', error);
        reject(error);
      }
    });
  }

  // Disconnetti WebSocket
  static disconnectWebSocket(): void {
    if (this.stompClient) {
      console.log('🔌 Disconnecting WebSocket...');
      this.stompClient.deactivate();
      this.stompClient = null;
      this.isConnected = false;
      this.subscriptions.clear();
      this.notifyConnectionCallbacks(false);
      console.log('✅ WebSocket disconnected');
    }
  }

  // Controlla se WebSocket è connesso
  static isWebSocketConnected(): boolean {
    return this.isConnected && this.stompClient?.connected === true;
  }

  // CORREZIONE PRINCIPALE: Subscribe migliorata per gestire tutti i tipi di messaggio
  static subscribeToChat(
    chatId: string, 
    onMessageReceived: (message: ChatMessage) => void
  ): () => void {
    if (!this.stompClient || !this.isConnected) {
      console.error('❌ WebSocket not connected when trying to subscribe to chat:', chatId);
      throw new Error('WebSocket non connesso');
    }

    console.log('🔔 Subscribing to chat:', chatId);

    const subscription = this.stompClient.subscribe(
      `/topic/chatroom/${chatId}`, 
      (message) => {
        try {
          console.log('📨 Raw WebSocket message received:', message.body);
          
          const receivedMessage: ChatMessage = JSON.parse(message.body);
          
          console.log('✅ Parsed message successfully:', {
            id: receivedMessage.chatRoomId,
            type: receivedMessage.type,
            senderId: receivedMessage.senderId,
            chatRoomId: receivedMessage.chatRoomId,
            content: receivedMessage.content?.substring(0, 100) + '...',
            fileUrl: receivedMessage.fileUrl,
            fileName: receivedMessage.fileName,
            timestamp: receivedMessage.timestamp
          });
          
          // CORREZIONE: Validazione migliorata del messaggio
          if (!receivedMessage.senderId || !receivedMessage.chatRoomId) {
            console.warn('⚠️ Message missing required fields:', receivedMessage);
            return; // Non processare messaggi malformati
          }

          // CORREZIONE: Validazione del tipo di messaggio
          const validTypes = ['TEXT', 'IMAGE', 'VIDEO', 'FILE', 'CALL_INVITATION', 'CALL_EVENT', 'WEBRTC_SIGNAL'];
          if (receivedMessage.type && !validTypes.includes(receivedMessage.type)) {
            console.warn('⚠️ Unknown message type:', receivedMessage.type);
          }
          
          // CORREZIONE: Log specifico per messaggi di chiamata
          if (receivedMessage.type === 'CALL_INVITATION') {
            console.log('📞 Received CALL_INVITATION message');
          } else if (receivedMessage.type === 'CALL_EVENT') {
            console.log('📞 Received CALL_EVENT message');
          } else if (receivedMessage.type === 'WEBRTC_SIGNAL') {
            console.log('🔄 Received WEBRTC_SIGNAL message');
          }
          
          onMessageReceived(receivedMessage);
          
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
          console.error('Raw message body:', message.body);
        }
      }
    );

    // Funzione di cleanup
    const unsubscribe = () => {
      console.log('🔇 Unsubscribing from chat:', chatId);
      subscription.unsubscribe();
      this.subscriptions.delete(chatId);
    };

    this.subscriptions.set(chatId, unsubscribe);
    console.log('✅ Successfully subscribed to chat:', chatId);
    
    return unsubscribe;
  } 

  // CORREZIONE: Invia messaggio con validazione del tipo
  static sendMessage(message: ChatMessage): void {
    if (!this.stompClient || !this.isConnected) {
      console.error('❌ Cannot send message - WebSocket not connected');
      throw new Error('WebSocket non connesso');
    }

    // CORREZIONE: Validazione del messaggio prima dell'invio
    if (!message.senderId || !message.chatRoomId) {
      console.error('❌ Message missing required fields:', message);
      throw new Error('Message must have senderId and chatRoomId');
    }

    // CORREZIONE: Assegna tipo di default se mancante
    if (!message.type) {
      if (message.fileUrl) {
        const fileExtension = message.fileUrl.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')) {
          message.type = 'IMAGE';
        } else if (['mp4', 'avi', 'mov', 'wmv'].includes(fileExtension || '')) {
          message.type = 'VIDEO';
        }
      } else {
        message.type = 'CHAT';
      }
    }

    console.log('📤 Sending message via WebSocket:', {
      destination: '/app/chat.sendMessage',
      messageType: message.type,
      senderId: message.senderId,
      chatRoomId: message.chatRoomId,
      hasContent: !!message.content,
      hasFileUrl: !!message.fileUrl,
      contentPreview: message.content?.substring(0, 50) + (message.content && message.content.length > 50 ? '...' : ''),
      fileUrl: message.fileUrl,
      fileName: message.fileName
    });

    try {
      // CORREZIONE: Aggiungi timestamp se mancante
      const messageToSend = {
        ...message,
        timestamp: message.timestamp || new Date().toISOString()
      };

      this.stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(messageToSend)
      });
      
      console.log('✅ Message published to WebSocket successfully');
      
    } catch (error) {
      console.error('❌ Error publishing message to WebSocket:', error);
      throw error;
    }
  }

  // AGGIUNTA: Metodo specifico per inviare inviti di chiamata
  static sendCallInvitation(
    chatId: string,
    senderId: string,
    invitation: unknown
  ): void {
    console.log('📞 Sending call invitation:', invitation);
    
    this.sendMessage({
      // ID sarà assegnato dal server
      content: JSON.stringify(invitation),
      senderId,
      chatRoomId: chatId,
      type: 'CALL_INVITATION',
      timestamp: new Date().toISOString()
    });
  }

  // AGGIUNTA: Metodo specifico per inviare eventi di chiamata
  static sendCallEvent(
    chatId: string,
    senderId: string,
    event: unknown
  ): void {
    console.log('📞 Sending call event:', event);
    
    this.sendMessage({
      
      content: JSON.stringify(event),
      senderId,
      chatRoomId: chatId,
      type: 'CALL_EVENT',
      timestamp: new Date().toISOString()
    });
  }

  // AGGIUNTA: Metodo specifico per inviare segnali WebRTC
  static sendWebRTCSignal(
    chatId: string,
    senderId: string,
    signal: unknown
  ): void {
    console.log('🔄 Sending WebRTC signal:', signal);
    
    this.sendMessage({
      
      content: JSON.stringify(signal),
      senderId,
      chatRoomId: chatId,
      type: 'WEBRTC_SIGNAL',
      timestamp: new Date().toISOString()
    });
  }

  // Registra callback per cambiamenti di stato connessione
  static onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.add(callback);
    
    // Chiama immediatamente con lo stato corrente
    callback(this.isConnected);
    
    // Restituisce funzione per rimuovere il callback
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  // Notifica tutti i callback del cambio di stato
  private static notifyConnectionCallbacks(connected: boolean): void {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('❌ Error in connection callback:', error);
      }
    });
  }

  // Pulisci tutte le sottoscrizioni per una chat
  static unsubscribeFromChat(chatId: string): void {
    const unsubscribe = this.subscriptions.get(chatId);
    if (unsubscribe) {
      console.log('🔇 Unsubscribing from specific chat:', chatId);
      unsubscribe();
    } else {
      console.warn('⚠️ No subscription found for chat:', chatId);
    }
  }

  // Pulisci tutte le sottoscrizioni
  static unsubscribeAll(): void {
    console.log('🔇 Unsubscribing from all chats');
    this.subscriptions.forEach((unsubscribe, chatId) => {
      console.log('🔇 Unsubscribing from chat:', chatId);
      unsubscribe();
    });
    this.subscriptions.clear();
  }

  // Ottieni lista delle chat sottoscritte
  static getSubscribedChats(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  // AGGIUNTA: Metodo per verificare la salute della connessione
  static getConnectionHealth(): {
    isConnected: boolean;
    subscriptions: number;
    clientState: string;
  } {
    return {
      isConnected: this.isConnected,
      subscriptions: this.subscriptions.size,
      clientState: this.stompClient?.connected ? 'connected' : 
                   this.stompClient?.active ? 'connecting' : 'disconnected'
    };
  }

  // AGGIUNTA: Metodo per forzare la riconnessione
  static async forceReconnect(): Promise<void> {
    console.log('🔄 Forcing WebSocket reconnection...');
    
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
    
    // Attendi un momento prima di riconnettersi
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return this.initializeWebSocket();
  }
}