
//TODO : modify the code 
import { ApiService } from './api';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  User, 
  ApiResponse, 
} from '@/types/api';

export class AuthService {
  private userId: string | null = "";
  private currentUser: string | null = "";

  // Login
  static async login(credentials: LoginRequest): Promise<void> {
    try {
      this.clearUserData(); // Pulisci i dati utente precedenti
      await ApiService.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
      this.saveUser(credentials.username,"currentUser");
      this.getProfile(credentials.username);
      
      
      // Con i cookie HTTP-only, il server imposta automaticamente i cookie
      //this.setCurrentUser(response.data.username);
      
    } catch(error)  {
        console.error('❌ POST', error);
        throw new Error('Errore durante il login:');
    }
  }

  // Registrazione
  static async register(userData: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await ApiService.post<ApiResponse<LoginResponse>>('/users/register', userData);
      
      // Con i cookie HTTP-only, il server imposta automaticamente i cookie
      
      return response.data

    } catch{
        throw new Error('Errore durante la registrazione');
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      // Il server rimuoverà automaticamente i cookie HTTP-only
      await ApiService.post<void>('/auth/logout');
    } catch (error) {
      console.error('Errore durante il logout:', error);
    } finally {
      // Rimuovi solo i dati utente salvati localmente
      this.clearUserData();
      // Redirect viene gestito nell'ApiService
    }
  }

  // Ottieni profilo utente aggiornato
  static async getProfile(username:string): Promise<User> {
    try {
      const response = await ApiService.get<User>('/users/username/' + username);
      this.saveUser(response.id, username); // Salva l'ID utente e il nome utente
      return response;
    } catch {
        throw new Error('Errore nel recupero del profilo');
    }
  }

  static clearUserData(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
  }

 //TODO : implementare metodo isAuthenticated

//TODO : implementare il metodo per verificare il token JWT

  // Metodo di utilità per gestire errori di autenticazione
  static handleAuthError(): void {
    this.clearUserData();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

//TODO : func verify token

  static getUser(userId:string): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(userId);
    }
    return null;
  }
  static saveUser(username: string,userId:string): void {
   
    sessionStorage.setItem(userId, username);
      
  }

  static getCurrentUser(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('currentUser');
    }
    return null;
  }

  static getCurrentUserId(): string | null {
    if (typeof window !== 'undefined') {
      const username = this.getCurrentUser();
      return sessionStorage.getItem(username || '');
    }
    return null;
  }
}