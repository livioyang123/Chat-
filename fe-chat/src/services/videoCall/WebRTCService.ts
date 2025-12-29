// services/WebRTCService.ts - VERSIONE COMPLETAMENTE CORRETTA

export class WebRTCService {
  private static peerConnections = new Map<string, RTCPeerConnection>();
  private static localStream: MediaStream | null = null;
  private static remoteStreams = new Map<string, MediaStream>();
  private static isInitialized = false;
  
  // CORREZIONE: Configurazione ICE migliorata
  private static configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
  };

  // CORREZIONE PRINCIPALE: Inizializzazione stream con retry e fallback
  static async initializeLocalStream(video = true, audio = true): Promise<MediaStream> {
    console.log('🎥 Initializing local stream:', { video, audio });
    
    // Se c'è già uno stream valido, riutilizzalo
    if (this.localStream && this.localStream.active) {
      const videoTracks = this.localStream.getVideoTracks();
      const audioTracks = this.localStream.getAudioTracks();
      
      const hasValidVideo = video ? videoTracks.length > 0 && videoTracks[0].readyState === 'live' : true;
      const hasValidAudio = audio ? audioTracks.length > 0 && audioTracks[0].readyState === 'live' : true;
      
      if (hasValidVideo && hasValidAudio) {
        console.log('✅ Reusing existing valid stream');
        return this.localStream;
      }
    }
    
    // Chiudi stream esistente se presente
    if (this.localStream) {
      console.log('🔄 Closing existing stream');
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Strategia progressive fallback per ottenere media
    const strategies = [
      // Strategia 1: Alta qualità
      {
        video: video ? {
          width: { ideal: 1280, max: 1920, min: 640 },
          height: { ideal: 720, max: 1080, min: 480 },
          frameRate: { ideal: 30, max: 60, min: 15 },
          facingMode: 'user'
        } : false,
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      },
      // Strategia 2: Qualità media
      {
        video: video ? {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15 }
        } : false,
        audio: audio ? true : false
      },
      // Strategia 3: Solo audio se video fallisce
      {
        video: false,
        audio: audio ? true : false
      }
    ];

    let lastError: Error | null = null;
    
    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`🔄 Trying strategy ${i + 1}:`, strategies[i]);
        
        const stream = await navigator.mediaDevices.getUserMedia(strategies[i]);
        
        if (!stream || stream.getTracks().length === 0) {
          throw new Error('Empty stream received');
        }
        
        // Verifica validità delle tracce
        const videoTracks = stream.getVideoTracks();
        const audioTracks = stream.getAudioTracks();
        
        console.log('📊 Stream acquired:', {
          videoTracks: videoTracks.length,
          audioTracks: audioTracks.length,
          videoSettings: videoTracks[0]?.getSettings(),
          audioSettings: audioTracks[0]?.getSettings()
        });
        
        // Verifica che le tracce siano live
        const allTracksLive = stream.getTracks().every(track => track.readyState === 'live');
        
        if (!allTracksLive) {
          console.warn('⚠️ Some tracks not live, trying next strategy');
          stream.getTracks().forEach(track => track.stop());
          continue;
        }
        
        this.localStream = stream;
        this.isInitialized = true;
        
        // Setup event listeners per le tracce
        stream.getTracks().forEach(track => {
          track.addEventListener('ended', () => {
            console.log(`📡 Track ended: ${track.kind}`);
          });
          
          track.addEventListener('mute', () => {
            console.log(`🔇 Track muted: ${track.kind}`);
          });
          
          track.addEventListener('unmute', () => {
            console.log(`🔊 Track unmuted: ${track.kind}`);
          });
        });
        
        console.log('✅ Stream initialized successfully');
        return stream;
        
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Strategy ${i + 1} failed:`, error);
        
        if (i === strategies.length - 1) {
          // Ultima strategia fallita
          break;
        }
      }
    }
    
    // Tutte le strategie fallite
    console.error('❌ All strategies failed, last error:', lastError);
    
    if (lastError) {
      if (lastError.name === 'NotAllowedError') {
        throw new Error('Camera/microphone access denied. Please allow access and try again.');
      } else if (lastError.name === 'NotFoundError') {
        throw new Error('No camera or microphone found. Please check your devices.');
      } else if (lastError.name === 'NotReadableError') {
        throw new Error('Camera/microphone is being used by another application.');
      }
    }
    
    throw new Error('Failed to access media devices: ' + (lastError?.message || 'Unknown error'));
  }

  // CORREZIONE: Creazione peer connection con gestione robusta
  static async createPeerConnection(
    peerId: string,
    onRemoteStream: (stream: MediaStream) => void,
    onIceCandidate: (candidate: RTCIceCandidate) => void
  ): Promise<RTCPeerConnection> {
    
    console.log(`🔗 Creating peer connection for ${peerId}`);
    
    // Chiudi connessione esistente
    if (this.peerConnections.has(peerId)) {
      this.closePeerConnection(peerId);
    }
    
    const peerConnection = new RTCPeerConnection(this.configuration);
    
    // CORREZIONE: Gestione stream remoto con retry
    peerConnection.ontrack = (event) => {
      console.log(`📡 Track received from ${peerId}:`, {
        kind: event.track.kind,
        enabled: event.track.enabled,
        readyState: event.track.readyState,
        streams: event.streams.length
      });
      
      const [remoteStream] = event.streams;
      if (remoteStream && remoteStream.getTracks().length > 0) {
        // Aspetta che il stream sia completamente pronto
        setTimeout(() => {
          if (remoteStream.getTracks().some(track => track.readyState === 'live')) {
            console.log(`✅ Setting remote stream for ${peerId}`);
            this.remoteStreams.set(peerId, remoteStream);
            onRemoteStream(remoteStream);
          } else {
            console.warn(`⚠️ Remote stream not ready for ${peerId}, retrying...`);
            // Retry dopo un breve delay
            setTimeout(() => {
              if (remoteStream.getTracks().some(track => track.readyState === 'live')) {
                this.remoteStreams.set(peerId, remoteStream);
                onRemoteStream(remoteStream);
              }
            }, 1000);
          }
        }, 100);
      }
    };
    
    // ICE candidate handling
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`🧊 ICE candidate for ${peerId}:`, event.candidate.candidate.substring(0, 50) + '...');
        onIceCandidate(event.candidate);
      } else {
        console.log(`🧊 ICE gathering complete for ${peerId}`);
      }
    };
    
    // Connection state monitoring
    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      console.log(`🔄 Connection state for ${peerId}: ${state}`);
      
      if (state === 'failed') {
        console.error(`❌ Connection failed for ${peerId}, attempting restart...`);
        // Potresti implementare ICE restart qui
        this.restartIce(peerId).catch(console.error);
      }
    };
    
    peerConnection.oniceconnectionstatechange = () => {
      console.log(`🧊 ICE state for ${peerId}: ${peerConnection.iceConnectionState}`);
    };
    
    // CORREZIONE: Aggiungi tracce locali se disponibili
    if (this.localStream) {
      console.log(`📤 Adding local tracks to ${peerId}`);
      
      for (const track of this.localStream.getTracks()) {
        try {
          const sender = peerConnection.addTrack(track, this.localStream);
          console.log(`✅ Added ${track.kind} track to ${peerId}`, sender);
        } catch (error) {
          console.error(`❌ Failed to add ${track.kind} track to ${peerId}:`, error);
        }
      }
    } else {
      console.warn(`⚠️ No local stream available when creating connection to ${peerId}`);
    }
    
    this.peerConnections.set(peerId, peerConnection);
    console.log(`✅ Peer connection created for ${peerId}`);
    
    return peerConnection;
  }

  // CORREZIONE: Offer creation con validation
  static async createOffer(peerId: string): Promise<RTCSessionDescriptionInit> {
    const peerConnection = this.peerConnections.get(peerId);
    if (!peerConnection) {
      throw new Error(`No peer connection found for ${peerId}`);
    }
    
    console.log(`📤 Creating offer for ${peerId}`);
    
    try {
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      if (!offer.sdp) {
        throw new Error('Empty SDP in offer');
      }
      
      console.log(`📤 Offer created for ${peerId}, SDP length: ${offer.sdp.length}`);
      
      await peerConnection.setLocalDescription(offer);
      console.log(`✅ Local description set for ${peerId}`);
      
      return offer;
    } catch (error) {
      console.error(`❌ Error creating offer for ${peerId}:`, error);
      throw error;
    }
  }

  // Answer creation
  static async createAnswer(peerId: string): Promise<RTCSessionDescriptionInit> {
    const peerConnection = this.peerConnections.get(peerId);
    if (!peerConnection) {
      throw new Error(`No peer connection found for ${peerId}`);
    }
    
    console.log(`📥 Creating answer for ${peerId}`);
    
    try {
      const answer = await peerConnection.createAnswer();
      
      if (!answer.sdp) {
        throw new Error('Empty SDP in answer');
      }
      
      console.log(`📥 Answer created for ${peerId}`);
      
      await peerConnection.setLocalDescription(answer);
      console.log(`✅ Local description set for ${peerId}`);
      
      return answer;
    } catch (error) {
      console.error(`❌ Error creating answer for ${peerId}:`, error);
      throw error;
    }
  }

  // Handle remote offer
  static async handleRemoteOffer(peerId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    const peerConnection = this.peerConnections.get(peerId);
    if (!peerConnection) {
      throw new Error(`No peer connection found for ${peerId}`);
    }
    
    console.log(`📥 Handling remote offer from ${peerId}`);
    
    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      console.log(`✅ Remote offer set for ${peerId}`);
    } catch (error) {
      console.error(`❌ Error setting remote offer for ${peerId}:`, error);
      throw error;
    }
  }

  // Handle remote answer
  static async handleRemoteAnswer(peerId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peerConnection = this.peerConnections.get(peerId);
    if (!peerConnection) {
      throw new Error(`No peer connection found for ${peerId}`);
    }
    
    console.log(`📥 Handling remote answer from ${peerId}`);
    
    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log(`✅ Remote answer set for ${peerId}`);
    } catch (error) {
      console.error(`❌ Error setting remote answer for ${peerId}:`, error);
      throw error;
    }
  }

  // Handle ICE candidate
  static async handleRemoteIceCandidate(peerId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peerConnection = this.peerConnections.get(peerId);
    if (!peerConnection) {
      console.warn(`No peer connection found for ${peerId} when handling ICE candidate`);
      return;
    }
    
    try {
      if (candidate && candidate.candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log(`✅ ICE candidate added for ${peerId}`);
      }
    } catch (error) {
      console.error(`❌ Error adding ICE candidate for ${peerId}:`, error);
    }
  }

  // CORREZIONE: Toggle functions migliorati
  static toggleMute(): boolean {
    if (!this.localStream) return true;
    
    const audioTracks = this.localStream.getAudioTracks();
    if (audioTracks.length === 0) return true;
    
    const currentlyMuted = !audioTracks[0].enabled;
    const newMutedState = !currentlyMuted;
    
    audioTracks.forEach(track => {
      track.enabled = !newMutedState;
    });
    
    console.log(`🎤 Audio ${newMutedState ? 'muted' : 'unmuted'}`);
    return newMutedState;
  }

  static toggleVideo(): boolean {
    if (!this.localStream) return true;
    
    const videoTracks = this.localStream.getVideoTracks();
    if (videoTracks.length === 0) return true;
    
    const currentlyDisabled = !videoTracks[0].enabled;
    const newDisabledState = !currentlyDisabled;
    
    videoTracks.forEach(track => {
      track.enabled = !newDisabledState;
    });
    
    console.log(`📹 Video ${newDisabledState ? 'disabled' : 'enabled'}`);
    return newDisabledState;
  }

  // Cleanup functions
  static closePeerConnection(peerId: string): void {
    const peerConnection = this.peerConnections.get(peerId);
    if (peerConnection) {
      console.log(`🔒 Closing peer connection for ${peerId}`);
      
      try {
        peerConnection.close();
      } catch (error) {
        console.error(`Error closing peer connection for ${peerId}:`, error);
      }
      
      this.peerConnections.delete(peerId);
      this.remoteStreams.delete(peerId);
    }
  }

  static closeAllConnections(): void {
    console.log('🔒 Closing all connections');
    
    this.peerConnections.forEach((pc, peerId) => {
      this.closePeerConnection(peerId);
    });
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream = null;
    }
    
    this.isInitialized = false;
    console.log('✅ All connections closed');
  }

  // Getters
  static getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  static getRemoteStream(peerId: string): MediaStream | null {
    return this.remoteStreams.get(peerId) || null;
  }

  static getPeerConnection(peerId: string): RTCPeerConnection | null {
    return this.peerConnections.get(peerId) || null;
  }

  static getAllRemoteStreams(): Map<string, MediaStream> {
    return new Map(this.remoteStreams);
  }

  // ICE restart for failed connections
  static async restartIce(peerId: string): Promise<void> {
    const peerConnection = this.peerConnections.get(peerId);
    if (!peerConnection) return;

    console.log(`🔄 Restarting ICE for ${peerId}`);
    
    try {
      const offer = await peerConnection.createOffer({ iceRestart: true });
      await peerConnection.setLocalDescription(offer);
      console.log(`✅ ICE restart initiated for ${peerId}`);
    } catch (error) {
      console.error(`❌ ICE restart failed for ${peerId}:`, error);
    }
  }

  // Debug information
  static getConnectionStates(): Record<string, {
    connectionState: RTCPeerConnectionState;
    iceConnectionState: RTCIceConnectionState;
    iceGatheringState: RTCIceGatheringState;
    signalingState: RTCSignalingState;
    localDescription: boolean;
    remoteDescription: boolean;
  }> {
    const states: Record<string, {
      connectionState: RTCPeerConnectionState;
      iceConnectionState: RTCIceConnectionState;
      iceGatheringState: RTCIceGatheringState;
      signalingState: RTCSignalingState;
      localDescription: boolean;
      remoteDescription: boolean;
    }> = {};
    
    this.peerConnections.forEach((pc, peerId) => {
      states[peerId] = {
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        iceGatheringState: pc.iceGatheringState,
        signalingState: pc.signalingState,
        localDescription: !!pc.localDescription,
        remoteDescription: !!pc.remoteDescription
      };
    });
    
    return states;
  }

  // Media device capabilities
  static async getMediaCapabilities(): Promise<{
    hasCamera: boolean;
    hasMicrophone: boolean;
    devices: MediaDeviceInfo[];
  }> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      return {
        hasCamera: devices.some(d => d.kind === 'videoinput'),
        hasMicrophone: devices.some(d => d.kind === 'audioinput'),
        devices: devices
      };
    } catch (error) {
      console.error('Error getting media capabilities:', error);
      return {
        hasCamera: false,
        hasMicrophone: false,
        devices: []
      };
    }
  }
}