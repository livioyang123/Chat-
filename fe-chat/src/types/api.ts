// Tipi base
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
  export interface SearchRequest{
  searchTerm: string;
  currentUserId: string;
  excludeFriends?: boolean;
  limit?: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: unknown;
}

// Tipi per l'autenticazione
export interface LoginRequest {
  
  username: string;
  password: string;
}

export interface LoginResponse {
  username: string;
  message: string;
  roles: string[];
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

// Tipi per gli utenti
export interface User {
  id: string;
  email: string;
  username: string;
  roles: string[];
  friends: User[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface ChatResponse {
  id: string;
  name: string;
}

export interface CreateChatRequest {
  name: string;
  description?: string;
  participantIds?: string[];
}

export interface ChatMessage {
  id:string;
  content: string;
  senderId: string;
  chatRoomId: string;
  type?: 'CHAT' | 'IMAGE' | 'VIDEO'|'WEBRTC_SIGNAL' | 'CALL_INVITATION' | 'CALL_EVENT';
  fileUrl?: string;
  fileName?: string;
  timestamp?:string
}

export interface SendMessageRequest {
  chatId: string;
  content: string;
  type?: 'text' | 'image' | 'file';
}

// Tipi per i filtri e la paginazione
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ChatFilters extends PaginationParams {
  search?: string;
  type?: 'public' | 'private' | 'group';
  participantId?: string;
}

export interface MessageFilters extends PaginationParams {
  chatId: string;
  fromDate?: string;
  toDate?: string;
  senderId?: string;
}

export interface ChatRoomResponse {
  arr : ChatRoom[];
}

export interface ChatRoom {
  id: string; 
  name: string;
  description?: string;
  participantIds: string[];
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    type: string;
    fileName: string;
    fileSize: number;
  } | null;
}