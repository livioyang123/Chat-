import { useEffect, useCallback, useState, useRef } from 'react';
import { MessageService } from '@/services/messageService';
import type { ChatMessage, MessageFilters } from '@/types/api';
import { IoSendSharp, IoAttach, IoClose } from "react-icons/io5";
import Image from 'next/image';
import messageStyle from "@/styles/messageWindow.module.css";
import inputStyle from "@/styles/messageInput.module.css";
import modalStyle from "@/styles/mediaModal.module.css";

interface MessageWindowProps {
  chatId: string;
  chatName: string;
  currentUserId: string;
  chatParticipants: string[];
}

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm', 'video/mov'
];

export default function MessageWindow({ chatId, chatName, currentUserId, chatParticipants }: MessageWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  
  // Modal state
  const [modalMedia, setModalMedia] = useState<{url: string; type: 'image' | 'video'} | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const connectionCallbackRef = useRef<(() => void) | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Rome'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    const initWebSocket = async () => {
      try {
        await MessageService.initializeWebSocket();
        connectionCallbackRef.current = MessageService.onConnectionChange(setIsConnected);
      } catch  {
        setError('Errore connessione WebSocket');
      }
    };

    initWebSocket();

    return () => {
      connectionCallbackRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (!chatId || !MessageService.isWebSocketConnected()) return;

    unsubscribeRef.current?.();

    try {
      unsubscribeRef.current = MessageService.subscribeToChat(
        chatId,
        (message: ChatMessage) => {
          setMessages(prev => [...prev, message]);
        }
      );
    } catch (error) {
      console.error('Errore sottoscrizione chat:', error);
    }

    return () => {
      unsubscribeRef.current?.();
    };
  }, [chatId, isConnected]);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setError(null);
      return;
    }

    const loadMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        const filters: MessageFilters = { chatId };
        const response = await MessageService.getChatMessages(filters);
        setMessages(response);
      } catch  {
        setError('Errore nel caricamento dei messaggi');
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [chatId]);

  useEffect(() => {
    if (!chatId || !MessageService.isWebSocketConnected()) return;

    const unsubTyping = MessageService.subscribeToTyping(chatId, (data) => {
      const { userId, username, isTyping } = data;
      
      if (userId === currentUserId) return;
      
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        if (isTyping && username) {
          newMap.set(userId, username);
        } else {
          newMap.delete(userId);
        }
        return newMap;
      });
    });

    const unsubStatus = MessageService.subscribeToOnlineStatus(chatId, (data) => {
      const { userId, status } = data;
      
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (status === 'online') {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    });

    MessageService.sendOnlineStatus(chatId, currentUserId, 'online');

    const heartbeat = setInterval(() => {
      MessageService.sendOnlineStatus(chatId, currentUserId, 'online');
    }, 20000);
  
    return () => {
      unsubTyping();
      unsubStatus();
      clearInterval(heartbeat);
      MessageService.sendOnlineStatus(chatId, currentUserId, 'offline');
    };
  }, [chatId, currentUserId]);

  const handleTyping = useCallback(() => {
    MessageService.sendTypingIndicator(chatId, currentUserId, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      MessageService.sendTypingIndicator(chatId, currentUserId, false);
    }, 2000);
  }, [chatId, currentUserId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    handleTyping();
  };

  const renderTypingIndicator = () => {
    if (typingUsers.size === 0) return null;

    const names = Array.from(typingUsers.values());
    const text = names.length === 1 
      ? `${names[0]} sta scrivendo...`
      : names.length === 2
      ? `${names[0]} e ${names[1]} stanno scrivendo...`
      : `${names[0]} e altri stanno scrivendo...`;

    return (
      <div className={messageStyle["typing-indicator"]}>
        <span>{text}</span>
        <span className={messageStyle["typing-dots"]}>
          <span>.</span><span>.</span><span>.</span>
        </span>
      </div>
    );
  };

  const onlineCount = onlineUsers.size - (onlineUsers.has(currentUserId) ? 1 : 0);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setFilePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setFilePreviewUrl(null);
    }
  }, [selectedFile]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Tipo di file non supportato');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File troppo grande (max 100MB)');
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !isConnected) return;

    setIsUploading(true);

    try {
      let messageData: ChatMessage;

      if (selectedFile) {
        const { url: fileUrl } = await MessageService.uploadFile(selectedFile, chatId);
        
        messageData = {
          senderId: currentUserId,
          chatRoomId: chatId,
          content: newMessage.trim() || "",
          type: selectedFile.type.startsWith('image/') ? 'IMAGE' : 'VIDEO',
          fileUrl,
          fileName: selectedFile.name,
        };
      } else {
        messageData = {
          content: newMessage.trim(),
          senderId: currentUserId,
          chatRoomId: chatId,
          type: 'CHAT'
        };
      }

      MessageService.sendMessage(messageData);

      setNewMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch  {
      setError('Errore nell\'invio del messaggio');
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handler per aprire il modal
  const openMediaModal = (url: string, type: 'image' | 'video') => {
    setModalMedia({ url, type });
  };

  const closeMediaModal = () => {
    setModalMedia(null);
  };

  const renderImage = (message: ChatMessage) => (
    <div className={messageStyle["message-media"]}>
      <div 
        className={messageStyle["message-image-container"]}
        onClick={() => openMediaModal(message.fileUrl || '', 'image')}
      >
        <img
          src={message.fileUrl || ""}
          alt={message.fileName || 'Immagine condivisa'}
          className={messageStyle["message-image"]}
        />
      </div>
      {message.content && (
        <div className={messageStyle["message-caption"]}>{message.content}</div>
      )}
    </div>
  );

  const renderVideo = (message: ChatMessage) => (
    <div className={messageStyle["message-media"]}>
      <div 
        className={messageStyle["message-video-container"]}
        onClick={() => openMediaModal(message.fileUrl || '', 'video')}
      >
        <video 
          className={messageStyle["message-video"]}
          preload="metadata"
          aria-label={`Video: ${message.fileName || 'Video condiviso'}`}
        >
          <source src={message.fileUrl} type="video/mp4" />
          <source src={message.fileUrl} type="video/webm" />
          <source src={message.fileUrl} type="video/quicktime" />
        </video>
        <div className={messageStyle["video-play-overlay"]}>▶</div>
      </div>
      {message.content && (
        <div className={messageStyle["message-caption"]}>{message.content}</div>
      )}
    </div>
  );

  const renderMessageContent = (message: ChatMessage) => {
    switch (message.type) {
      case 'IMAGE':
        return renderImage(message);
      case 'VIDEO':
        return renderVideo(message);
      default:
        return <div className={messageStyle["message-text"]}>{message.content}</div>;
    }
  };

  const renderFilePreview = () => {
    if (!selectedFile || !filePreviewUrl) return null;

    return (
      <div className={inputStyle["file-preview"]}>
        <div className={inputStyle["preview-content"]}>
          <div className={inputStyle["preview-media"]}>
            {selectedFile.type.startsWith('image/') ? (
              <div className={inputStyle["preview-image-container"]}>
                <Image 
                  src={filePreviewUrl} 
                  alt="Anteprima immagine selezionata" 
                  width={80}
                  height={80}
                  className={inputStyle["preview-image"]}
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ) : (
              <video 
                src={filePreviewUrl} 
                className={inputStyle["preview-video"]}
                muted
                aria-label="Anteprima video selezionato"
              />
            )}
          </div>
          <div className={inputStyle["preview-info"]}>
            <div className={inputStyle["preview-filename"]}>{selectedFile.name}</div>
            <div className={inputStyle["preview-filesize"]}>{formatFileSize(selectedFile.size)}</div>
          </div>
          <button 
            onClick={removeSelectedFile}
            className={inputStyle["preview-remove"]}
            type="button"
            title="Rimuovi file selezionato"
            aria-label="Rimuovi file selezionato"
          >
            <IoClose />
          </button>
        </div>
      </div>
    );
  };

  if (!chatId) {
    return <div className={messageStyle["message-window"]}>Seleziona una chat per iniziare</div>;
  }

  if (loading) {
    return <div className={messageStyle["message-window"]}></div>;
  }

  if (error && !messages.length) {
    return <div className={`${messageStyle["message-window"]} ${messageStyle.error}`}>{error}</div>;
  }

  const canSend = (newMessage.trim() || selectedFile) && isConnected && !isUploading;

  return (
    <div className={messageStyle["message-window"]}>
      <div className={messageStyle.messageHeader}>
        <span>{chatName}</span>
        <div className={messageStyle["connection-status"]}>
          {chatParticipants.length > 2 && onlineCount > 0 && (
            <span className={messageStyle["online-count"]}>{onlineCount} online</span>
          )}
          <div className={`${messageStyle["status-indicator"]} ${isConnected ? messageStyle.connected : messageStyle.disconnected}`} />
          <span className={messageStyle["status-text"]}>{isConnected ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      <div className={messageStyle.messages}>
        {messages.length === 0 ? (
          <div className={messageStyle["no-messages"]}>Nessun messaggio in questa chat</div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`${messageStyle.message} ${message.senderId === currentUserId ? messageStyle["message-own"] : messageStyle["message-other"]}`}
            >
              <div className={messageStyle["message-meta"]}>
                <span className={messageStyle["message-time"]}>
                  {message.timestamp ? formatTimestamp(message.timestamp) : ''}
                </span>
              </div>

              <div className={messageStyle["message-content"]}>
                {message.senderId !== currentUserId && (
                  <div className={messageStyle["message-sender"]}>{message.senderId}</div>
                )}
                {renderMessageContent(message)}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {renderTypingIndicator()}
      {renderFilePreview()}

      <div id={inputStyle["message-input"]}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,video/*"
          className={inputStyle["hidden-file-input"]}
          title="Seleziona un file da allegare"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className={inputStyle["attach-button"]}
          disabled={!isConnected || isUploading}
          type="button"
          title="Allega file"
          aria-label="Allega immagine o video"
        >
          <IoAttach />
        </button>

        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={selectedFile ? "Aggiungi una caption..." : "Scrivi un messaggio..."}
          className={inputStyle["message-input-field"]}
          disabled={!isConnected || isUploading}
        />
        
        <div
          id={inputStyle["btnSend"]}
          onClick={sendMessage}
          className={`${inputStyle["send-button"]} ${!canSend ? inputStyle.disabled : ''}`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && canSend) {
              e.preventDefault();
              sendMessage();
            }
          }}
          aria-label="Invia messaggio"
          title="Invia messaggio"
        >
          {isUploading ? '...' : <IoSendSharp />}
        </div>
      </div>

      {!isConnected && (
        <div className={messageStyle["connection-error"]}>
          Connessione WebSocket non disponibile
        </div>
      )}

      {isUploading && (
        <div className={messageStyle["upload-progress"]}>
          Caricamento file in corso...
        </div>
      )}

      {error && (
        <div className={messageStyle["error-message"]}>
          {error}
        </div>
      )}

      {/* MODAL PER VISUALIZZARE MEDIA A TUTTO SCHERMO */}
      {modalMedia && (
        <div className={modalStyle["media-modal"]} onClick={closeMediaModal}>
          <div className={modalStyle["modal-close"]}>
            <IoClose />
          </div>
          <div className={modalStyle["modal-content"]} onClick={(e) => e.stopPropagation()}>
            {modalMedia.type === 'image' ? (
              <img 
                src={modalMedia.url} 
                alt="Immagine full screen" 
                className={modalStyle["modal-image"]}
              />
            ) : (
              <video 
                src={modalMedia.url} 
                controls 
                autoPlay
                className={modalStyle["modal-video"]}
              >
                Il tuo browser non supporta i video.
              </video>
            )}
          </div>
        </div>
      )}
    </div>
  );
}