// Export di tutti i servizi
export { ApiService } from './api';
export { AuthService } from './authService';
export { ChatService  } from './chatService';
export {MessageService} from '@/services/messageService'
export { UserService } from './userService';

// Export dei tipi
export * from '../types/api';

// Configurazione API client di default
export { default as apiClient } from './api';

// Utility per gestire errori API
export const handleApiError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const err = error as { response?: { data?: { message?: string } }, message?: string };
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    if (err.message) {
      return err.message;
    }
  }
  return 'Si è verificato un errore imprevisto';
};

// Utility per creare query parameters
export const createQueryString = (params: Record<string, string | number | boolean | null | undefined>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  return searchParams.toString();
};