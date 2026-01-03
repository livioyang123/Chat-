// fe-chat/src/services/authService.ts - VERSIONE CORRETTA

import { ApiService } from './api';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  User, 
} from '@/types/api';

export class AuthService {
  private static userId: string | null = "";
  private static currentUser: string | null = "";

  // CORREZIONE 1: Login migliorato con gestione errori dettagliata
  static async login(credentials: LoginRequest): Promise<void> {
    try {
      console.log('🔐 Attempting login with:', { username: credentials.username });
      
      this.clearUserData(); // Pulisci i dati precedenti
      
      // CORREZIONE: Gestione corretta della risposta
      const response = await ApiService.post<LoginResponse>(
        '/auth/login', 
        credentials
      );
      
      console.log('✅ Login response:', response);
      
      // CORREZIONE: Salva username e carica profilo
      this.saveUser(credentials.username, "currentUser");
      
      // Carica profilo utente per ottenere l'ID
      await this.getProfile(credentials.username);
      
      console.log('✅ Login successful');
      
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // CORREZIONE: Gestione errori più dettagliata
      if (error && typeof error === 'object') {
        const axiosError = error as { 
          response?: { 
            status?: number; 
            data?: { message?: string } 
          }; 
          message?: string 
        };
        
        if (axiosError.response?.status === 401) {
          throw new Error('Credenziali non valide. Verifica username e password.');
        } else if (axiosError.response?.status === 500) {
          throw new Error('Errore del server. Riprova più tardi.');
        } else if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }
      
      throw new Error('Errore durante il login. Verifica la connessione al server.');
    }
  }

  // Registrazione
  static async register(userData: RegisterRequest): Promise<LoginResponse> {
    try {
      console.log('📝 Attempting registration:', { username: userData.username, email: userData.email });
      
      const response = await ApiService.post<LoginResponse>(
        '/users/register', 
        userData
      );
      
      console.log('✅ Registration successful');
      return response;
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      if (error && typeof error === 'object') {
        const axiosError = error as { 
          response?: { 
            status?: number; 
            data?: { message?: string; msg?: string } 
          } 
        };
        
        if (axiosError.response?.status === 400) {
          throw new Error('Username già in uso');
        } else if (axiosError.response?.data?.message || axiosError.response?.data?.msg) {
          throw new Error(axiosError.response.data.message || axiosError.response.data.msg);
        }
      }
      
      throw new Error('Errore durante la registrazione');
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      await ApiService.post<void>('/auth/logout');
    } catch (error) {
      console.error('Errore durante il logout:', error);
    } finally {
      this.clearUserData();
      // Redirect viene gestito nell'ApiService
    }
  }

  // CORREZIONE 2: getProfile migliorato
  static async getProfile(username: string): Promise<User> {
    try {
      console.log('👤 Loading profile for:', username);
      
      const response = await ApiService.get<User>('/users/username/' + username);
      
      console.log('✅ Profile loaded:', { id: response.id, username: response.username });
      
      // Salva l'ID utente usando il suo username come chiave
      this.saveUser(response.id, username);
      
      return response;
      
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      throw new Error('Errore nel recupero del profilo');
    }
  }

  // CORREZIONE 3: Utility methods migliorati
  static clearUserData(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      console.log('🧹 Session storage cleared');
    }
  }

  static handleAuthError(): void {
    this.clearUserData();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  static getUser(userId: string): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(userId);
    }
    return null;
  }

  static saveUser(value: string, key: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, value);
      console.log(`💾 Saved: ${key} = ${value}`);
    }
  }

  static getCurrentUser(): string | null {
    if (typeof window !== 'undefined') {
      const username = sessionStorage.getItem('currentUser');
      console.log('📖 Current user:', username);
      return username;
    }
    return null;
  }

  static getCurrentUserId(): string | null {
    if (typeof window !== 'undefined') {
      const username = this.getCurrentUser();
      if (!username) return null;
      
      const userId = sessionStorage.getItem(username);
      console.log('📖 Current user ID:', userId);
      return userId;
    }
    return null;
  }

  // CORREZIONE 4: Aggiungi metodo per verificare se l'utente è autenticato
  static isAuthenticated(): boolean {
    const username = this.getCurrentUser();
    const userId = this.getCurrentUserId();
    const isAuth = !!(username && userId);
    console.log('🔒 Is authenticated:', isAuth);
    return isAuth;
  }
}