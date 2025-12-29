// types/videoApi.ts

export interface VideoCall {
  id: string;
  initiatorId: string;
  participantIds: string[];
  roomId: string;
  type: 'ONE_TO_ONE' | 'GROUP';
  status: 'INITIATED' | 'ONGOING' | 'ENDED';
  sessionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CallParticipant {
  id: string;
  callId: string;
  userId: string;
  peerId?: string;
  status: 'INVITED' | 'JOINED' | 'LEFT' | 'DECLINED';
  joinedAt?: string;
  leftAt?: string;
  isMuted: boolean;
  isVideoEnabled: boolean;
}

export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice-candidate';
  callId: string;
  fromUserId: string;
  toUserId: string;
  data: RTCSessionDescriptionInit | RTCIceCandidateInit;
}

export interface CallInvitation {
  id: string;
  initiatorId: string;
  participantIds: string[];
  roomId: string;
  type: 'ONE_TO_ONE' | 'GROUP';
}

export interface CallEvent {
  type: 'participant-joined' | 'participant-left' | 'call-ended' | 'media-updated' | 'participant-declined';
  callId: string;
  data: CallParticipant | null;
  timestamp: string;
}

export interface InitiateCallRequest {
  initiatorId: string;
  participantIds: string[];
  type: 'ONE_TO_ONE' | 'GROUP';
}

// types/api.ts (aggiunte ai tuoi tipi esistenti)

export type MessageType = 
  | 'CHAT' 
  | 'TEXT' 
  | 'IMAGE' 
  | 'VIDEO' 
  | 'FILE' 
  | 'CALL_INVITATION' 
  | 'CALL_EVENT' 
  | 'WEBRTC_SIGNAL' 
  | 'JOIN';

export interface ChatMessage {
  id?: string;
  content?: string;
  senderId: string;
  chatRoomId: string;
  recipientId?: string;
  type?: MessageType;
  timestamp?: string;
  fileUrl?: string;
  fileName?: string;
}

// types/webrtc.ts

export interface MediaConstraintsConfig {
  video: MediaTrackConstraints | boolean;
  audio: MediaTrackConstraints | boolean;
}

export interface MediaStreamConstraints {
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
}

export interface PeerConnectionState {
  connectionState: RTCPeerConnectionState;
  iceConnectionState: RTCIceConnectionState;
  iceGatheringState: RTCIceGatheringState;
  signalingState: RTCSignalingState;
  localDescription: boolean;
  remoteDescription: boolean;
}

export interface MediaCapabilities {
  hasCamera: boolean;
  hasMicrophone: boolean;
  devices: MediaDeviceInfo[];
  error?: string;
}

// types/component.ts

export interface VideoCallComponentProps {
  currentUserId: string;
  chatId: string;
  participantIds: string[];
  onCallEnd: () => void;
}

export interface VideoElementRef {
  current: HTMLVideoElement | null;
}

export interface RemoteVideoRefs {
  current: Map<string, HTMLVideoElement>;
}

export interface CallSubscriptions {
  current: Map<string, () => void>;
}