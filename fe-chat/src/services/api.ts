import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// Configurazione base
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Crea istanza Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // FONDAMENTALE: abilita l'invio automatico dei cookie
});

// Interceptor per le richieste
apiClient.interceptors.request.use(
  (config) => {
    // Log delle richieste in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor per le risposte
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data);
    }

    // Gestione errori globali
    if (error.response?.status === 401) {
      console.error('Token scaduto o non valido, redirect al login');
      // Puoi decidere se fare redirect automatico o gestire diversamente
      // window.location.href = '/login';
    }

    if (error.response?.status === 403) {
      console.error('Accesso negato');
    }

    if (error.response?.status >= 500) {
      console.error('Errore del server');
    }

    return Promise.reject(error);
  }
);

// Classe wrapper per metodi HTTP comuni
export class ApiService {
  static async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  }

  static async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  }

  static async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  }

  static async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  }

  static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  }

  static async logout(): Promise<void> {
    await apiClient.post<void>('/auth/logout');
    // Reindirizza dopo il logout
    window.location.href = '/login';
  }
}

export default apiClient;