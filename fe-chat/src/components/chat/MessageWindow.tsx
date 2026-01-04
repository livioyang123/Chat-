import { useEffect, useCallback, useState, useRef } from 'react';
import { MessageService } from '@/services/messageService';
import type { ChatMessage, MessageFilters } from '@/types/api';
import { IoSendSharp, IoAttach, IoClose } from "react-icons/io5";
import Image from 'next/image';
import style from "@/styles/chatWindow.module.css";

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
      <div className={style["typing-indicator"]}>
        <span>{text}</span>
        <span className={style["typing-dots"]}>
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
    <div className={style["message-media"]}>
      <div 
        className={style["message-image-container"]}
        onClick={() => openMediaModal(message.fileUrl || '', 'image')}
      >
        <img
          src={message.fileUrl || ""}
          alt={message.fileName || 'Immagine condivisa'}
          className={style["message-image"]}
        />
      </div>
      {message.content && (
        <div className={style["message-caption"]}>{message.content}</div>
      )}
    </div>
  );

  const renderVideo = (message: ChatMessage) => (
    <div className={style["message-media"]}>
      <div 
        className={style["message-video-container"]}
        onClick={() => openMediaModal(message.fileUrl || '', 'video')}
      >
        <video 
          className={style["message-video"]}
          preload="metadata"
          aria-label={`Video: ${message.fileName || 'Video condiviso'}`}
        >
          <source src={message.fileUrl} type="video/mp4" />
          <source src={message.fileUrl} type="video/webm" />
          <source src={message.fileUrl} type="video/quicktime" />
        </video>
        <div className={style["video-play-overlay"]}>▶</div>
      </div>
      {message.content && (
        <div className={style["message-caption"]}>{message.content}</div>
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
        return <div className={style["message-text"]}>{message.content}</div>;
    }
  };

  const renderFilePreview = () => {
    if (!selectedFile || !filePreviewUrl) return null;

    return (
      <div className={style["file-preview"]}>
        <div className={style["preview-content"]}>
          <div className={style["preview-media"]}>
            {selectedFile.type.startsWith('image/') ? (
              <div className={style["preview-image-container"]}>
                <Image 
                  src={filePreviewUrl} 
                  alt="Anteprima immagine selezionata" 
                  width={80}
                  height={80}
                  className={style["preview-image"]}
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ) : (
              <video 
                src={filePreviewUrl} 
                className={style["preview-video"]}
                muted
                aria-label="Anteprima video selezionato"
              />
            )}
          </div>
          <div className={style["preview-info"]}>
            <div className={style["preview-filename"]}>{selectedFile.name}</div>
            <div className={style["preview-filesize"]}>{formatFileSize(selectedFile.size)}</div>
          </div>
          <button 
            onClick={removeSelectedFile}
            className={style["preview-remove"]}
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
    return <div className={style["message-window"]}>Seleziona una chat per iniziare</div>;
  }

  if (loading) {
    return <div className={style["message-window"]}></div>;
  }

  if (error && !messages.length) {
    return <div className={`${style["message-window"]} ${style.error}`}>{error}</div>;
  }

  const canSend = (newMessage.trim() || selectedFile) && isConnected && !isUploading;

  return (
    <div className={style["message-window"]}>
      <div className={style.messageHeader}>
        <span>{chatName}</span>
        <div className={style["connection-status"]}>
          {chatParticipants.length > 2 && onlineCount > 0 && (
            <span className={style["online-count"]}>{onlineCount} online</span>
          )}
          <div className={`${style["status-indicator"]} ${isConnected ? style.connected : style.disconnected}`} />
          <span className={style["status-text"]}>{isConnected ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      <div className={style.messages}>
        {messages.length === 0 ? (
          <div className={style["no-messages"]}>Nessun messaggio in questa chat</div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`${style.message} ${message.senderId === currentUserId ? style["message-own"] : style["message-other"]}`}
            >
              <div className={style["message-meta"]}>
                <span className={style["message-time"]}>
                  {message.timestamp ? formatTimestamp(message.timestamp) : ''}
                </span>
              </div>

              <div className={style["message-content"]}>
                {message.senderId !== currentUserId && (
                  <div className={style["message-sender"]}>{message.senderId}</div>
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

      <div id={style["message-input"]}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,video/*"
          className={style["hidden-file-input"]}
          title="Seleziona un file da allegare"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className={style["attach-button"]}
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
          className={style["message-input-field"]}
          disabled={!isConnected || isUploading}
        />
        
        <div
          id={style["btnSend"]}
          onClick={sendMessage}
          className={`${style["send-button"]} ${!canSend ? style.disabled : ''}`}
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
        <div className={style["connection-error"]}>
          Connessione WebSocket non disponibile
        </div>
      )}

      {isUploading && (
        <div className={style["upload-progress"]}>
          Caricamento file in corso...
        </div>
      )}

      {error && (
        <div className={style["error-message"]}>
          {error}
        </div>
      )}

      {/* MODAL PER VISUALIZZARE MEDIA A TUTTO SCHERMO */}
      {modalMedia && (
        <div className={style["media-modal"]} onClick={closeMediaModal}>
          <div className={style["modal-close"]}>
            <IoClose />
          </div>
          <div className={style["modal-content"]} onClick={(e) => e.stopPropagation()}>
            {modalMedia.type === 'image' ? (
              <img 
                src={modalMedia.url} 
                alt="Immagine full screen" 
                className={style["modal-image"]}
              />
            ) : (
              <video 
                src={modalMedia.url} 
                controls 
                autoPlay
                className={style["modal-video"]}
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