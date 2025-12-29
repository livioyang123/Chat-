"use strict";
// services/WebRTCService.ts - VERSIONE COMPLETAMENTE CORRETTA
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.WebRTCService = void 0;
var WebRTCService = /** @class */ (function () {
    function WebRTCService() {
    }
    // CORREZIONE PRINCIPALE: Inizializzazione stream con retry e fallback
    WebRTCService.initializeLocalStream = function (video, audio) {
        var _a, _b;
        if (video === void 0) { video = true; }
        if (audio === void 0) { audio = true; }
        return __awaiter(this, void 0, Promise, function () {
            var videoTracks, audioTracks, hasValidVideo, hasValidAudio, strategies, lastError, i, stream, videoTracks, audioTracks, allTracksLive, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log('🎥 Initializing local stream:', { video: video, audio: audio });
                        // Se c'è già uno stream valido, riutilizzalo
                        if (this.localStream && this.localStream.active) {
                            videoTracks = this.localStream.getVideoTracks();
                            audioTracks = this.localStream.getAudioTracks();
                            hasValidVideo = video ? videoTracks.length > 0 && videoTracks[0].readyState === 'live' : true;
                            hasValidAudio = audio ? audioTracks.length > 0 && audioTracks[0].readyState === 'live' : true;
                            if (hasValidVideo && hasValidAudio) {
                                console.log('✅ Reusing existing valid stream');
                                return [2 /*return*/, this.localStream];
                            }
                        }
                        // Chiudi stream esistente se presente
                        if (this.localStream) {
                            console.log('🔄 Closing existing stream');
                            this.localStream.getTracks().forEach(function (track) { return track.stop(); });
                            this.localStream = null;
                        }
                        strategies = [
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
                        lastError = null;
                        i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(i < strategies.length)) return [3 /*break*/, 6];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        console.log("\uD83D\uDD04 Trying strategy " + (i + 1) + ":", strategies[i]);
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia(strategies[i])];
                    case 3:
                        stream = _c.sent();
                        if (!stream || stream.getTracks().length === 0) {
                            throw new Error('Empty stream received');
                        }
                        videoTracks = stream.getVideoTracks();
                        audioTracks = stream.getAudioTracks();
                        console.log('📊 Stream acquired:', {
                            videoTracks: videoTracks.length,
                            audioTracks: audioTracks.length,
                            videoSettings: (_a = videoTracks[0]) === null || _a === void 0 ? void 0 : _a.getSettings(),
                            audioSettings: (_b = audioTracks[0]) === null || _b === void 0 ? void 0 : _b.getSettings()
                        });
                        allTracksLive = stream.getTracks().every(function (track) { return track.readyState === 'live'; });
                        if (!allTracksLive) {
                            console.warn('⚠️ Some tracks not live, trying next strategy');
                            stream.getTracks().forEach(function (track) { return track.stop(); });
                            return [3 /*break*/, 5];
                        }
                        this.localStream = stream;
                        this.isInitialized = true;
                        // Setup event listeners per le tracce
                        stream.getTracks().forEach(function (track) {
                            track.addEventListener('ended', function () {
                                console.log("\uD83D\uDCE1 Track ended: " + track.kind);
                            });
                            track.addEventListener('mute', function () {
                                console.log("\uD83D\uDD07 Track muted: " + track.kind);
                            });
                            track.addEventListener('unmute', function () {
                                console.log("\uD83D\uDD0A Track unmuted: " + track.kind);
                            });
                        });
                        console.log('✅ Stream initialized successfully');
                        return [2 /*return*/, stream];
                    case 4:
                        error_1 = _c.sent();
                        lastError = error_1;
                        console.error("\u274C Strategy " + (i + 1) + " failed:", error_1);
                        if (i === strategies.length - 1) {
                            // Ultima strategia fallita
                            return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 5];
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6:
                        // Tutte le strategie fallite
                        console.error('❌ All strategies failed, last error:', lastError);
                        if (lastError) {
                            if (lastError.name === 'NotAllowedError') {
                                throw new Error('Camera/microphone access denied. Please allow access and try again.');
                            }
                            else if (lastError.name === 'NotFoundError') {
                                throw new Error('No camera or microphone found. Please check your devices.');
                            }
                            else if (lastError.name === 'NotReadableError') {
                                throw new Error('Camera/microphone is being used by another application.');
                            }
                        }
                        throw new Error('Failed to access media devices: ' + ((lastError === null || lastError === void 0 ? void 0 : lastError.message) || 'Unknown error'));
                }
            });
        });
    };
    // CORREZIONE: Creazione peer connection con gestione robusta
    WebRTCService.createPeerConnection = function (peerId, onRemoteStream, onIceCandidate) {
        return __awaiter(this, void 0, Promise, function () {
            var peerConnection, _i, _a, track, sender;
            var _this = this;
            return __generator(this, function (_b) {
                console.log("\uD83D\uDD17 Creating peer connection for " + peerId);
                // Chiudi connessione esistente
                if (this.peerConnections.has(peerId)) {
                    this.closePeerConnection(peerId);
                }
                peerConnection = new RTCPeerConnection(this.configuration);
                // CORREZIONE: Gestione stream remoto con retry
                peerConnection.ontrack = function (event) {
                    console.log("\uD83D\uDCE1 Track received from " + peerId + ":", {
                        kind: event.track.kind,
                        enabled: event.track.enabled,
                        readyState: event.track.readyState,
                        streams: event.streams.length
                    });
                    var remoteStream = event.streams[0];
                    if (remoteStream && remoteStream.getTracks().length > 0) {
                        // Aspetta che il stream sia completamente pronto
                        setTimeout(function () {
                            if (remoteStream.getTracks().some(function (track) { return track.readyState === 'live'; })) {
                                console.log("\u2705 Setting remote stream for " + peerId);
                                _this.remoteStreams.set(peerId, remoteStream);
                                onRemoteStream(remoteStream);
                            }
                            else {
                                console.warn("\u26A0\uFE0F Remote stream not ready for " + peerId + ", retrying...");
                                // Retry dopo un breve delay
                                setTimeout(function () {
                                    if (remoteStream.getTracks().some(function (track) { return track.readyState === 'live'; })) {
                                        _this.remoteStreams.set(peerId, remoteStream);
                                        onRemoteStream(remoteStream);
                                    }
                                }, 1000);
                            }
                        }, 100);
                    }
                };
                // ICE candidate handling
                peerConnection.onicecandidate = function (event) {
                    if (event.candidate) {
                        console.log("\uD83E\uDDCA ICE candidate for " + peerId + ":", event.candidate.candidate.substring(0, 50) + '...');
                        onIceCandidate(event.candidate);
                    }
                    else {
                        console.log("\uD83E\uDDCA ICE gathering complete for " + peerId);
                    }
                };
                // Connection state monitoring
                peerConnection.onconnectionstatechange = function () {
                    var state = peerConnection.connectionState;
                    console.log("\uD83D\uDD04 Connection state for " + peerId + ": " + state);
                    if (state === 'failed') {
                        console.error("\u274C Connection failed for " + peerId + ", attempting restart...");
                        // Potresti implementare ICE restart qui
                        _this.restartIce(peerId)["catch"](console.error);
                    }
                };
                peerConnection.oniceconnectionstatechange = function () {
                    console.log("\uD83E\uDDCA ICE state for " + peerId + ": " + peerConnection.iceConnectionState);
                };
                // CORREZIONE: Aggiungi tracce locali se disponibili
                if (this.localStream) {
                    console.log("\uD83D\uDCE4 Adding local tracks to " + peerId);
                    for (_i = 0, _a = this.localStream.getTracks(); _i < _a.length; _i++) {
                        track = _a[_i];
                        try {
                            sender = peerConnection.addTrack(track, this.localStream);
                            console.log("\u2705 Added " + track.kind + " track to " + peerId, sender);
                        }
                        catch (error) {
                            console.error("\u274C Failed to add " + track.kind + " track to " + peerId + ":", error);
                        }
                    }
                }
                else {
                    console.warn("\u26A0\uFE0F No local stream available when creating connection to " + peerId);
                }
                this.peerConnections.set(peerId, peerConnection);
                console.log("\u2705 Peer connection created for " + peerId);
                return [2 /*return*/, peerConnection];
            });
        });
    };
    // CORREZIONE: Offer creation con validation
    WebRTCService.createOffer = function (peerId) {
        return __awaiter(this, void 0, Promise, function () {
            var peerConnection, offer, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        peerConnection = this.peerConnections.get(peerId);
                        if (!peerConnection) {
                            throw new Error("No peer connection found for " + peerId);
                        }
                        console.log("\uD83D\uDCE4 Creating offer for " + peerId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, peerConnection.createOffer({
                                offerToReceiveAudio: true,
                                offerToReceiveVideo: true
                            })];
                    case 2:
                        offer = _a.sent();
                        if (!offer.sdp) {
                            throw new Error('Empty SDP in offer');
                        }
                        console.log("\uD83D\uDCE4 Offer created for " + peerId + ", SDP length: " + offer.sdp.length);
                        return [4 /*yield*/, peerConnection.setLocalDescription(offer)];
                    case 3:
                        _a.sent();
                        console.log("\u2705 Local description set for " + peerId);
                        return [2 /*return*/, offer];
                    case 4:
                        error_2 = _a.sent();
                        console.error("\u274C Error creating offer for " + peerId + ":", error_2);
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Answer creation
    WebRTCService.createAnswer = function (peerId) {
        return __awaiter(this, void 0, Promise, function () {
            var peerConnection, answer, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        peerConnection = this.peerConnections.get(peerId);
                        if (!peerConnection) {
                            throw new Error("No peer connection found for " + peerId);
                        }
                        console.log("\uD83D\uDCE5 Creating answer for " + peerId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, peerConnection.createAnswer()];
                    case 2:
                        answer = _a.sent();
                        if (!answer.sdp) {
                            throw new Error('Empty SDP in answer');
                        }
                        console.log("\uD83D\uDCE5 Answer created for " + peerId);
                        return [4 /*yield*/, peerConnection.setLocalDescription(answer)];
                    case 3:
                        _a.sent();
                        console.log("\u2705 Local description set for " + peerId);
                        return [2 /*return*/, answer];
                    case 4:
                        error_3 = _a.sent();
                        console.error("\u274C Error creating answer for " + peerId + ":", error_3);
                        throw error_3;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Handle remote offer
    WebRTCService.handleRemoteOffer = function (peerId, offer) {
        return __awaiter(this, void 0, Promise, function () {
            var peerConnection, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        peerConnection = this.peerConnections.get(peerId);
                        if (!peerConnection) {
                            throw new Error("No peer connection found for " + peerId);
                        }
                        console.log("\uD83D\uDCE5 Handling remote offer from " + peerId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, peerConnection.setRemoteDescription(new RTCSessionDescription(offer))];
                    case 2:
                        _a.sent();
                        console.log("\u2705 Remote offer set for " + peerId);
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        console.error("\u274C Error setting remote offer for " + peerId + ":", error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Handle remote answer
    WebRTCService.handleRemoteAnswer = function (peerId, answer) {
        return __awaiter(this, void 0, Promise, function () {
            var peerConnection, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        peerConnection = this.peerConnections.get(peerId);
                        if (!peerConnection) {
                            throw new Error("No peer connection found for " + peerId);
                        }
                        console.log("\uD83D\uDCE5 Handling remote answer from " + peerId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, peerConnection.setRemoteDescription(new RTCSessionDescription(answer))];
                    case 2:
                        _a.sent();
                        console.log("\u2705 Remote answer set for " + peerId);
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        console.error("\u274C Error setting remote answer for " + peerId + ":", error_5);
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Handle ICE candidate
    WebRTCService.handleRemoteIceCandidate = function (peerId, candidate) {
        return __awaiter(this, void 0, Promise, function () {
            var peerConnection, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        peerConnection = this.peerConnections.get(peerId);
                        if (!peerConnection) {
                            console.warn("No peer connection found for " + peerId + " when handling ICE candidate");
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        if (!(candidate && candidate.candidate)) return [3 /*break*/, 3];
                        return [4 /*yield*/, peerConnection.addIceCandidate(new RTCIceCandidate(candidate))];
                    case 2:
                        _a.sent();
                        console.log("\u2705 ICE candidate added for " + peerId);
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_6 = _a.sent();
                        console.error("\u274C Error adding ICE candidate for " + peerId + ":", error_6);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // CORREZIONE: Toggle functions migliorati
    WebRTCService.toggleMute = function () {
        if (!this.localStream)
            return true;
        var audioTracks = this.localStream.getAudioTracks();
        if (audioTracks.length === 0)
            return true;
        var currentlyMuted = !audioTracks[0].enabled;
        var newMutedState = !currentlyMuted;
        audioTracks.forEach(function (track) {
            track.enabled = !newMutedState;
        });
        console.log("\uD83C\uDFA4 Audio " + (newMutedState ? 'muted' : 'unmuted'));
        return newMutedState;
    };
    WebRTCService.toggleVideo = function () {
        if (!this.localStream)
            return true;
        var videoTracks = this.localStream.getVideoTracks();
        if (videoTracks.length === 0)
            return true;
        var currentlyDisabled = !videoTracks[0].enabled;
        var newDisabledState = !currentlyDisabled;
        videoTracks.forEach(function (track) {
            track.enabled = !newDisabledState;
        });
        console.log("\uD83D\uDCF9 Video " + (newDisabledState ? 'disabled' : 'enabled'));
        return newDisabledState;
    };
    // Cleanup functions
    WebRTCService.closePeerConnection = function (peerId) {
        var peerConnection = this.peerConnections.get(peerId);
        if (peerConnection) {
            console.log("\uD83D\uDD12 Closing peer connection for " + peerId);
            try {
                peerConnection.close();
            }
            catch (error) {
                console.error("Error closing peer connection for " + peerId + ":", error);
            }
            this.peerConnections["delete"](peerId);
            this.remoteStreams["delete"](peerId);
        }
    };
    WebRTCService.closeAllConnections = function () {
        var _this = this;
        console.log('🔒 Closing all connections');
        this.peerConnections.forEach(function (pc, peerId) {
            _this.closePeerConnection(peerId);
        });
        if (this.localStream) {
            this.localStream.getTracks().forEach(function (track) {
                track.stop();
            });
            this.localStream = null;
        }
        this.isInitialized = false;
        console.log('✅ All connections closed');
    };
    // Getters
    WebRTCService.getLocalStream = function () {
        return this.localStream;
    };
    WebRTCService.getRemoteStream = function (peerId) {
        return this.remoteStreams.get(peerId) || null;
    };
    WebRTCService.getPeerConnection = function (peerId) {
        return this.peerConnections.get(peerId) || null;
    };
    WebRTCService.getAllRemoteStreams = function () {
        return new Map(this.remoteStreams);
    };
    // ICE restart for failed connections
    WebRTCService.restartIce = function (peerId) {
        return __awaiter(this, void 0, Promise, function () {
            var peerConnection, offer, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        peerConnection = this.peerConnections.get(peerId);
                        if (!peerConnection)
                            return [2 /*return*/];
                        console.log("\uD83D\uDD04 Restarting ICE for " + peerId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, peerConnection.createOffer({ iceRestart: true })];
                    case 2:
                        offer = _a.sent();
                        return [4 /*yield*/, peerConnection.setLocalDescription(offer)];
                    case 3:
                        _a.sent();
                        console.log("\u2705 ICE restart initiated for " + peerId);
                        return [3 /*break*/, 5];
                    case 4:
                        error_7 = _a.sent();
                        console.error("\u274C ICE restart failed for " + peerId + ":", error_7);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Debug information
    WebRTCService.getConnectionStates = function () {
        var states = {};
        this.peerConnections.forEach(function (pc, peerId) {
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
    };
    // Media device capabilities
    WebRTCService.getMediaCapabilities = function () {
        return __awaiter(this, void 0, Promise, function () {
            var devices, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, navigator.mediaDevices.enumerateDevices()];
                    case 1:
                        devices = _a.sent();
                        return [2 /*return*/, {
                                hasCamera: devices.some(function (d) { return d.kind === 'videoinput'; }),
                                hasMicrophone: devices.some(function (d) { return d.kind === 'audioinput'; }),
                                devices: devices
                            }];
                    case 2:
                        error_8 = _a.sent();
                        console.error('Error getting media capabilities:', error_8);
                        return [2 /*return*/, {
                                hasCamera: false,
                                hasMicrophone: false,
                                devices: []
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    WebRTCService.peerConnections = new Map();
    WebRTCService.localStream = null;
    WebRTCService.remoteStreams = new Map();
    WebRTCService.isInitialized = false;
    // CORREZIONE: Configurazione ICE migliorata
    WebRTCService.configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
        ],
        iceCandidatePoolSize: 10,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require'
    };
    return WebRTCService;
}());
exports.WebRTCService = WebRTCService;
