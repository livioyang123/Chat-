import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageService } from '@/services/messageService';
import { VideoCallService } from '@/services/videoCall/videoCallService';
import { WebRTCService } from '@/services/videoCall/WebRTCService';
import { IoVideocam, IoVideocamOff, IoMic, IoMicOff, IoCall, IoCallOutline } from 'react-icons/io5';
import style from "@/styles/chatWindow.module.css";
import type { 
  VideoCall, 
  CallParticipant, 
  WebRTCSignal, 
  CallInvitation, 
  CallEvent
} from '@/types/videoApi';
import type { ChatMessage } from '@/types/api';

interface VideoCallComponentProps {
  currentUserId: string;
  chatId: string;
  participantIds: string[];
  onCallEnd: () => void;
}

export default function VideoCallComponent({ 
  currentUserId, 
  chatId, 
  participantIds, 
  onCallEnd 
}: VideoCallComponentProps) {
  // State
  const [currentCall, setCurrentCall] = useState<VideoCall | null>(null);
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallInvitation | null>(null);

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const subscriptionsRef = useRef<Map<string, () => void>>(new Map());
  const isCleaningUpRef = useRef(false);
  const currentCallRef = useRef<VideoCall | null>(null);

  // CORREZIONE 1: Aggiorna ref quando cambia currentCall
  useEffect(() => {
    currentCallRef.current = currentCall;
  }, [currentCall]);

  // CORREZIONE 2: Cleanup migliorato al beforeunload e unmount
  useEffect(() => {
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      const call = currentCallRef.current;
      if (call && !isCleaningUpRef.current) {
        // Impedisci la chiusura immediata per eseguire cleanup
        event.preventDefault();
        event.returnValue = '';
        
        try {
          if (call.initiatorId !== currentUserId) {
            await VideoCallService.leaveCall(call.id, currentUserId);
          } else {
            await VideoCallService.endCall(call.id, currentUserId);
          }
        } catch (error) {
          console.error('Error during cleanup on page unload:', error);
        }
      }
    };

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        const call = currentCallRef.current;
        if (call && !isCleaningUpRef.current) {
          try {
            if (call.initiatorId !== currentUserId) {
              await VideoCallService.leaveCall(call.id, currentUserId);
            } else {
              await VideoCallService.endCall(call.id, currentUserId);
            }
            cleanup();
          } catch (error) {
            console.error('Error during visibility change cleanup:', error);
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Cleanup finale al unmount
      const call = currentCallRef.current;
      if (call && !isCleaningUpRef.current) {
        VideoCallService.endCall(call.id, currentUserId).catch(console.error);
        cleanup();
      }
    };
  }, [currentUserId]);

  // CORREZIONE 3: Handler per inviti migliorato
  const handleCallInvitation = useCallback((message: ChatMessage) => {
    try {
      console.log('📞 Received call invitation:', message);
      
      if (message.type === 'CALL_INVITATION' && message.content) {
        const invitation: CallInvitation = JSON.parse(message.content);
        
        // Verifica che l'invito sia per questo utente e non sia da lui stesso
        if (invitation.participantIds.includes(currentUserId) && 
            invitation.initiatorId !== currentUserId) {
          console.log('✅ Valid call invitation received');
          setIncomingCall(invitation);
        }
      }
    } catch (error) {
      console.error('❌ Error parsing call invitation:', error);
    }
  }, [currentUserId]);

  // CORREZIONE 4: Handler eventi chiamata migliorato
  const handleCallEvent = useCallback((message: ChatMessage) => {
    try {
      if (message.type === 'CALL_EVENT' && message.content) {
        const event: CallEvent = JSON.parse(message.content);
        console.log('📡 Call event received:', event);
        
        switch (event.type) {
          case 'participant-joined':
            const joinedParticipant = event.data as CallParticipant;
            if (joinedParticipant.userId !== currentUserId) {
              console.log('👥 Remote participant joined:', joinedParticipant);
              setParticipants(prev => {
                const updated = [...prev.filter(p => p.userId !== joinedParticipant.userId), joinedParticipant];
                return updated;
              });
              
              // Inizia connessione WebRTC con il nuovo partecipante
              if (currentCall && currentCall.initiatorId === currentUserId) {
                setTimeout(() => {
                  createPeerConnectionAndOffer(joinedParticipant.userId, currentCall);
                }, 1000);
              }
            }
            break;
            
          case 'participant-left':
            const leftParticipant = event.data as CallParticipant;
            console.log('👋 Participant left:', leftParticipant);
            setParticipants(prev => prev.filter(p => p.userId !== leftParticipant.userId));
            WebRTCService.closePeerConnection(leftParticipant.userId);
            break;
            
          case 'call-ended':
            console.log('📞 Call ended by remote');
            cleanup();
            onCallEnd();
            break;
        }
      }
    } catch (error) {
      console.error('❌ Error parsing call event:', error);
    }
  }, [currentUserId, currentCall, onCallEnd]);

  // CORREZIONE 5: Handler WebRTC signals con retry
  const handleWebRTCSignal = useCallback(async (message: ChatMessage) => {
    try {
      if (message.type === 'WEBRTC_SIGNAL' && message.content) {
        const signal: WebRTCSignal = JSON.parse(message.content);
        
        if (signal.toUserId !== currentUserId) return;
        
        console.log('🔄 Processing WebRTC signal:', signal.type, 'from:', signal.fromUserId);
        
        // Assicurati che ci sia una connessione WebRTC
        if (!WebRTCService.getPeerConnection(signal.fromUserId)) {
          console.log('🔗 Creating peer connection for incoming signal');
          await WebRTCService.createPeerConnection(
            signal.fromUserId,
            (stream: MediaStream) => setRemoteStream(signal.fromUserId, stream),
            (candidate: RTCIceCandidate) => sendIceCandidate(signal.fromUserId, candidate)
          );
        }
        
        switch (signal.type) {
          case 'offer':
            await handleOffer(signal);
            break;
          case 'answer':
            await handleAnswer(signal);
            break;
          case 'ice-candidate':
            await handleIceCandidate(signal);
            break;
        }
      }
    } catch (error) {
      console.error('❌ Error handling WebRTC signal:', error);
      setError('Connection error: ' + (error as Error).message);
    }
  }, [currentUserId]);

  // CORREZIONE 6: Gestione offer migliorata
  const handleOffer = async (signal: WebRTCSignal) => {
    const peerId = signal.fromUserId;
    console.log(`📤 Processing offer from ${peerId}`);
    
    try {
      // Assicurati che il local stream sia inizializzato
      if (!WebRTCService.getLocalStream()) {
        console.log('🎥 Initializing local stream for incoming offer...');
        const stream = await WebRTCService.initializeLocalStream(isVideoEnabled, !isMuted);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(console.error);
        }
      }

      await WebRTCService.handleRemoteOffer(peerId, signal.data as RTCSessionDescriptionInit);
      const answer = await WebRTCService.createAnswer(peerId);
      
      if (currentCall) {
        sendWebRTCSignal('answer', currentCall.id, peerId, answer);
      }
    } catch (error) {
      console.error(`❌ Error handling offer from ${peerId}:`, error);
    }
  };

  const handleAnswer = async (signal: WebRTCSignal) => {
    try {
      await WebRTCService.handleRemoteAnswer(signal.fromUserId, signal.data as RTCSessionDescriptionInit);
    } catch (error) {
      console.error(`❌ Error handling answer:`, error);
    }
  };

  const handleIceCandidate = async (signal: WebRTCSignal) => {
    try {
      await WebRTCService.handleRemoteIceCandidate(signal.fromUserId, signal.data as RTCIceCandidateInit);
    } catch (error) {
      console.error(`❌ Error handling ICE candidate:`, error);
    }
  };

  // CORREZIONE 7: Invio segnali WebRTC
  const sendWebRTCSignal = (
    type: 'offer' | 'answer' | 'ice-candidate', 
    callId: string, 
    toUserId: string, 
    data: RTCSessionDescriptionInit | RTCIceCandidateInit
  ) => {
    const signal: WebRTCSignal = {
      type,
      callId,
      fromUserId: currentUserId,
      toUserId,
      data
    };

    MessageService.sendMessage({
      content: JSON.stringify(signal),
      senderId: currentUserId,
      chatRoomId: chatId,
      type: 'WEBRTC_SIGNAL',
      timestamp: new Date().toISOString()
    });
  };

  const sendIceCandidate = (toUserId: string, candidate: RTCIceCandidate) => {
    if (currentCall) {
      sendWebRTCSignal('ice-candidate', currentCall.id, toUserId, candidate);
    }
  };

  // CORREZIONE 8: SetRemoteStream con retry e fallback
  const setRemoteStream = (peerId: string, stream: MediaStream) => {
    console.log(`🎥 Setting remote stream for peer ${peerId}`);
    
    const trySetStream = (attempt = 1) => {
      const videoElement = remoteVideosRef.current.get(peerId);
      
      if (videoElement && stream && stream.getTracks().length > 0) {
        videoElement.srcObject = stream;
        
        videoElement.play()
          .then(() => console.log(`✅ Remote video playing for ${peerId}`))
          .catch(error => {
            console.error(`❌ Error playing remote video for ${peerId}:`, error);
            if (attempt < 3) {
              setTimeout(() => trySetStream(attempt + 1), 1000 * attempt);
            }
          });
          
        // Forza l'aggiornamento della UI
        videoElement.onloadedmetadata = () => {
          console.log(`🎥 Video metadata loaded for ${peerId}`);
        };
      } else if (attempt < 3) {
        setTimeout(() => trySetStream(attempt + 1), 500);
      }
    };
    
    trySetStream();
  };

  // CORREZIONE 9: Cleanup migliorato
  const cleanup = useCallback(() => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    
    console.log('🧹 Cleaning up video call');
    
    WebRTCService.closeAllConnections();
    
    subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
    subscriptionsRef.current.clear();
    
    setCurrentCall(null);
    setIsCallActive(false);
    setParticipants([]);
    setError(null);
    setIncomingCall(null);
    setIsConnecting(false);
    
    remoteVideosRef.current.clear();
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    isCleaningUpRef.current = false;
  }, []);

  // CORREZIONE 10: Setup subscriptions migliorato
  useEffect(() => {
    console.log('🔔 Setting up subscriptions for chat:', chatId);
    
    const unsubscribeChat = MessageService.subscribeToChat(
      chatId,
      (message: ChatMessage) => {
        // Ignora i messaggi che inviamo noi stessi per evitare loop
        if (message.senderId === currentUserId) return;
        
        switch (message.type) {
          case 'CALL_INVITATION':
            handleCallInvitation(message);
            break;
          case 'CALL_EVENT':
            handleCallEvent(message);
            break;
          case 'WEBRTC_SIGNAL':
            handleWebRTCSignal(message);
            break;
        }
      }
    );

    subscriptionsRef.current.set('chat', unsubscribeChat);

    return () => {
      unsubscribeChat();
      cleanup();
    };
  }, [chatId, currentUserId, handleCallInvitation, handleCallEvent, handleWebRTCSignal, cleanup]);

  // CORREZIONE 11: StartCall completamente rivisto
  const startCall = async () => {
    if (isConnecting || isCallActive) return;
    
    try {
      console.log('📞 Starting call with participants:', participantIds);
      setIsConnecting(true);
      setError(null);

      // Step 1: Inizializza stream locale
      const stream = await WebRTCService.initializeLocalStream(isVideoEnabled, !isMuted);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play();
      }

      // Step 2: Crea chiamata via API
      const call = await VideoCallService.initiateCall({
        initiatorId: currentUserId,
        participantIds,
        type: participantIds.length === 1 ? 'ONE_TO_ONE' : 'GROUP'
      });

      setCurrentCall(call);
      setIsCallActive(true);

      // Step 3: Invia inviti
      const invitation: CallInvitation = {
        id: call.id,
        initiatorId: call.initiatorId,
        participantIds: call.participantIds,
        roomId: call.roomId,
        type: call.type
      };

      MessageService.sendMessage({
        content: JSON.stringify(invitation),
        senderId: currentUserId,
        chatRoomId: chatId,
        type: 'CALL_INVITATION',
        timestamp: new Date().toISOString()
      });

      console.log('🎉 Call started successfully');

    } catch (error) {
      console.error('❌ Error starting call:', error);
      setError('Failed to start call: ' + (error as Error).message);
      cleanup();
    } finally {
      setIsConnecting(false);
    }
  };

  // CORREZIONE 12: createPeerConnectionAndOffer migliorato
  const createPeerConnectionAndOffer = async (participantId: string, call: VideoCall) => {
    try {
      console.log(`🔗 Creating connection for ${participantId}`);
      
      await WebRTCService.createPeerConnection(
        participantId,
        (stream: MediaStream) => setRemoteStream(participantId, stream),
        (candidate: RTCIceCandidate) => sendIceCandidate(participantId, candidate)
      );

      // Attendi che la connessione sia stabile
      await new Promise(resolve => setTimeout(resolve, 1000));

      const offer = await WebRTCService.createOffer(participantId);
      sendWebRTCSignal('offer', call.id, participantId, offer);
      
    } catch (error) {
      console.error(`❌ Error creating connection with ${participantId}:`, error);
    }
  };

  // CORREZIONE 13: AcceptCall migliorato
  const acceptCall = async (call: CallInvitation) => {
    try {
      console.log('✅ Accepting call:', call.id);
      setIsConnecting(true);

      // Inizializza stream locale
      const stream = await WebRTCService.initializeLocalStream(isVideoEnabled, !isMuted);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play();
      }

      // Unisciti alla chiamata
      const peerId = `peer_${currentUserId}_${Date.now()}`;
      await VideoCallService.joinCall(call.id, currentUserId, peerId);

      const videoCall: VideoCall = {
        id: call.id,
        initiatorId: call.initiatorId,
        participantIds: call.participantIds,
        roomId: call.roomId,
        type: call.type,
        status: 'ONGOING',
        sessionId: peerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCurrentCall(videoCall);
      setIsCallActive(true);
      setIncomingCall(null);

    } catch (error) {
      console.error('❌ Error accepting call:', error);
      setError('Failed to accept call');
    } finally {
      setIsConnecting(false);
    }
  };

  const declineCall = async (call: CallInvitation) => {
    try {
      await VideoCallService.declineCall(call.id, currentUserId);
      setIncomingCall(null);
    } catch (error) {
      console.error('❌ Error declining call:', error);
    }
  };

  const endCall = async () => {
    if (isCleaningUpRef.current) return;
    
    try {
      if (currentCall) {
        if (currentCall.initiatorId === currentUserId) {
          await VideoCallService.endCall(currentCall.id, currentUserId);
        } else {
          await VideoCallService.leaveCall(currentCall.id, currentUserId);
        }
      }
    } catch (error) {
      console.error('❌ Error ending call:', error);
    } finally {
      cleanup();
      onCallEnd();
    }
  };

  // CORREZIONE 14: Toggle functions corrette
  const toggleMute = async () => {
    try {
      const newMutedState = WebRTCService.toggleMute();
      setIsMuted(newMutedState);
      
      if (currentCall) {
        await VideoCallService.updateMediaState(
          currentCall.id,
          currentUserId,
          newMutedState,
          isVideoEnabled
        );
      }
    } catch (error) {
      console.error('❌ Error toggling mute:', error);
    }
  };

  const toggleVideo = async () => {
    try {
      const isVideoDisabled = WebRTCService.toggleVideo();
      const newVideoState = !isVideoDisabled;
      setIsVideoEnabled(newVideoState);
      
      if (currentCall) {
        await VideoCallService.updateMediaState(
          currentCall.id,
          currentUserId,
          isMuted,
          newVideoState
        );
      }
    } catch (error) {
      console.error('❌ Error toggling video:', error);
    }
  };

  // Render functions
  const renderIncomingCall = () => {
    if (!incomingCall) return null;

    return (
      <div className={style["incoming-call-overlay"]}>
        <div className={style["incoming-call-box"]}>
          <div className={style["incoming-call-content"]}>
            <h3>Incoming Call</h3>
            <p>From: {incomingCall.initiatorId}</p>
            <div className={style["incoming-call-buttons"]}>
              <button 
                onClick={() => declineCall(incomingCall)}
                className={style["decline-btn"]}
                disabled={isConnecting}
                style={{ backgroundColor: '#dc3545', color: 'white', margin: '5px' }}
              >
                Decline
              </button>
              <button 
                onClick={() => acceptCall(incomingCall)}
                className={style["accept-btn"]}
                disabled={isConnecting}
                style={{ backgroundColor: '#28a745', color: 'white', margin: '5px' }}
              >
                {isConnecting ? 'Accepting...' : 'Accept'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCallInterface = () => {
    if (!isCallActive) return null;

    return (
      <div className={style["call-interface"]}>
        {/* Video locale */}
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted
            style={{
              width: '200px',
              height: '150px',
              objectFit: 'cover',
              backgroundColor: '#000',
              transform: 'scaleX(-1)',
              border: '2px solid #007bff',
              borderRadius: '8px'
            }}
          />
          <div style={{ textAlign: 'center', color: 'white', fontSize: '12px' }}>
            You {isMuted && '(Muted)'} {!isVideoEnabled && '(No Video)'}
          </div>
        </div>

        {/* Video remoti */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '10px',
          padding: '20px',
          height: '100vh',
          backgroundColor: '#000'
        }}>
          {participants.map((participant) => (
            <div key={participant.userId} style={{
              position: 'relative',
              backgroundColor: '#333',
              borderRadius: '8px',
              overflow: 'hidden',
              minHeight: '300px'
            }}>
              <video
                ref={(el) => { 
                  if (el) {
                    remoteVideosRef.current.set(participant.userId, el);
                    
                    const existingStream = WebRTCService.getRemoteStream(participant.userId);
                    if (existingStream) {
                      el.srcObject = existingStream;
                      el.play().catch(console.error);
                    }
                  }
                }}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                {participant.userId}
              </div>
            </div>
          ))}
          
          {/* Placeholder per partecipanti in attesa */}
          {participantIds.filter(id => 
            id !== currentUserId && 
            !participants.some(p => p.userId === id)
          ).map(participantId => (
            <div key={`waiting-${participantId}`} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px',
              backgroundColor: '#333',
              borderRadius: '8px',
              color: 'white'
            }}>
              <p>Waiting for {participantId}...</p>
            </div>
          ))}
        </div>

        {/* Controlli */}
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: '10px 20px',
          borderRadius: '25px',
          zIndex: 1000
        }}>
          <button 
            onClick={toggleMute}
            style={{
              backgroundColor: isMuted ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {isMuted ? <IoMicOff size={24} /> : <IoMic size={24} />}
          </button>
          
          <button 
            onClick={toggleVideo}
            style={{
              backgroundColor: !isVideoEnabled ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {isVideoEnabled ? <IoVideocam size={24} /> : <IoVideocamOff size={24} />}
          </button>
          
          <button 
            onClick={endCall}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <IoCallOutline size={24} />x
          </button>
        </div>

        {/* Errori */}
        {error && (
          <div style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            backgroundColor: '#dc3545',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '5px',
            zIndex: 1000
          }}>
            <strong>Error:</strong> {error}
            <button 
              onClick={() => setError(null)}
              style={{ 
                marginLeft: '10px', 
                background: 'none', 
                border: 'none', 
                color: 'white',
                cursor: 'pointer' 
              }}
            >×</button>
          </div>
        )}
        
        {isConnecting && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            zIndex: 999
          }}>
            <div>Connecting...</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {!isCallActive && !incomingCall && (
        <button 
          onClick={startCall} 
          disabled={isConnecting || participantIds.length === 0} 
          style={{
            backgroundColor: participantIds.length === 0 ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: participantIds.length === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <IoCall size={20} />
          <span>{isConnecting ? 'Starting...' : 'Start Call'}</span>
        </button>
      )}
      {renderIncomingCall()}
      {renderCallInterface()}
    </>
  );
}