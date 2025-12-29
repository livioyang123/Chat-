//TODO :fix issues with path

import { ApiService } from './api';
import {
  ChatRoom,
  CreateChatRequest,
  ApiResponse,
  User
} from '../types/api';
import { AuthService } from './authService';


export class ChatService {
  
  static async getUserChats(): Promise<Array<ChatRoom>> {

    try {
      
      const username = AuthService.getCurrentUser(); // Ottieni l'username dell'utente corrente
      const user = await ApiService.get<User>(`/users/username/${username}`);
      const userId = user.id; // Assicurati di avere l'ID dell'utente

      const response = await ApiService.get<Array<ChatRoom>>('/chatrooms/participant/'+ userId);
      return response;
    } catch {
      
      throw new Error('Impossibile recuperare le chat');
      AuthService.handleAuthError();
    }
  
}

  // Ottieni dettagli di una chat specifica
  static async getChatById(chatId: string): Promise<ChatRoom> {
    const response = await ApiService.get<ApiResponse<ChatRoom>>(`/chats/${chatId}`);
    return response.data;
  }

  // Crea una nuova chat
  static async createChat(name:string,desc:string,parts: string[]): Promise<ChatRoom> {
    const currentUserId = AuthService.getCurrentUserId() || ""; 
    const username = AuthService.getCurrentUser() || "";
    parts.push(currentUserId); 
    name = name? name.trim() : `Chat di ${username}`;
    desc = desc ? desc.trim() : `Chat creata da ${username}`;
    const chatData: CreateChatRequest = {
      name: name,
      description: desc,
      participantIds: parts
    };
    const response = await ApiService.post<ChatRoom>('/chatrooms', chatData);
  
    return response;
  }

  // Aggiorna una chat
  static async updateChat(chatId: string, updates: Partial<CreateChatRequest>): Promise<ChatRoom> {
    const response = await ApiService.put<ApiResponse<ChatRoom>>(`/chats/${chatId}`, updates);
    return response.data;
  }

  // Elimina una chat
  static async deleteChat(chatId: string): Promise<void> {
    await ApiService.delete(`/chats/${chatId}`);
  }

  // Partecipa a una chat
  static async joinChat(chatId: string): Promise<ChatRoom> {
    const response = await ApiService.post<ApiResponse<ChatRoom>>(`/chats/${chatId}/join`);
    return response.data;
  }

  // Lascia una chat
  static async leaveChat(chatId: string): Promise<void> {
    await ApiService.post(`/chats/${chatId}/leave`);
  }

  // Aggiungi partecipante a una chat
  static async addParticipant(chatId: string, userId: string): Promise<ChatRoom> {
    const response = await ApiService.post<ApiResponse<ChatRoom>>(
      `/chats/${chatId}/participants`,
      { userId }
    );
    return response.data;
  }

  // Rimuovi partecipante da una chat
  static async removeParticipant(chatId: string, userId: string): Promise<void> {
    await ApiService.delete(`/chats/${chatId}/participants/${userId}`);
  }

  // Ottieni partecipanti di una chat
  static async getChatParticipants(chatId: string): Promise<User[]> {
    const response = await ApiService.get<ApiResponse<User[]>>(`/chats/${chatId}/participants`);
    return response.data;
  }

}
