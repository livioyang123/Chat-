//TODO: fix ussues with path

import { ApiService } from './api';
import {
  User,
  ApiResponse,
  SearchRequest,

} from '../types/api';

import { AuthService } from './authService';

export class UserService {

  // add
  static sendFriendRequest(friendId: string) {
    const currentUserId = AuthService.getCurrentUserId();
    const response = ApiService.post(`/users/${currentUserId}/friends/${friendId}`, {}); 
    return response;
  }
  

  // Ottieni utente per ID
  static async getUserById(userId: string): Promise<User> {
    const response = await ApiService.get<ApiResponse<User>>(`/users/${userId}`);
    return response.data;
  }

  // Cerca utenti
  static async searchUsers(query: string, lim?:number): Promise<User[]> {
    lim = lim ? lim : 10; // Imposta un limite predefinito se non specificato
    const SearchRequest: SearchRequest = {
      searchTerm: query,
      currentUserId: AuthService.getCurrentUserId() || "",
      excludeFriends: true, // Escludi amici dalla ricerca
      limit: lim // Limita i risultati a 10
    }
    const response = await ApiService.post<User[]>('/users/search/', SearchRequest);
    return response;
  }

  static async getCurrentUserFriends(): Promise<User[]> {
    const userId = AuthService.getCurrentUserId();
    const friends = await ApiService.get<User[]>(`/users/user/${userId}/friends`);
    return friends; 
  }

  // TODO:Cambia password
  



}