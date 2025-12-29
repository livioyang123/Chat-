"use strict";
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var messageService_1 = require("@/services/messageService");
var videoCallService_1 = require("@/services/videoCall/videoCallService");
var WebRTCService_1 = require("@/services/videoCall/WebRTCService");
var io5_1 = require("react-icons/io5");
var chatWindow_module_css_1 = require("@/styles/chatWindow.module.css");
function VideoCallComponent(_a) {
    var _this = this;
    var currentUserId = _a.currentUserId, chatId = _a.chatId, participantIds = _a.participantIds, onCallEnd = _a.onCallEnd;
    // State
    var _b = react_1.useState(null), currentCall = _b[0], setCurrentCall = _b[1];
    var _c = react_1.useState([]), participants = _c[0], setParticipants = _c[1];
    var _d = react_1.useState(false), isCallActive = _d[0], setIsCallActive = _d[1];
    var _e = react_1.useState(false), isMuted = _e[0], setIsMuted = _e[1];
    var _f = react_1.useState(true), isVideoEnabled = _f[0], setIsVideoEnabled = _f[1];
    var _g = react_1.useState(false), isConnecting = _g[0], setIsConnecting = _g[1];
    var _h = react_1.useState(null), error = _h[0], setError = _h[1];
    var _j = react_1.useState(null), incomingCall = _j[0], setIncomingCall = _j[1];
    // Refs
    var localVideoRef = react_1.useRef(null);
    var remoteVideosRef = react_1.useRef(new Map());
    var subscriptionsRef = react_1.useRef(new Map());
    var isCleaningUpRef = react_1.useRef(false);
    var currentCallRef = react_1.useRef(null);
    // CORREZIONE 1: Aggiorna ref quando cambia currentCall
    react_1.useEffect(function () {
        currentCallRef.current = currentCall;
    }, [currentCall]);
    // CORREZIONE 2: Cleanup migliorato al beforeunload e unmount
    react_1.useEffect(function () {
        var handleBeforeUnload = function (event) { return __awaiter(_this, void 0, void 0, function () {
            var call, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        call = currentCallRef.current;
                        if (!(call && !isCleaningUpRef.current)) return [3 /*break*/, 7];
                        // Impedisci la chiusura immediata per eseguire cleanup
                        event.preventDefault();
                        event.returnValue = '';
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        if (!(call.initiatorId !== currentUserId)) return [3 /*break*/, 3];
                        return [4 /*yield*/, videoCallService_1.VideoCallService.leaveCall(call.id, currentUserId)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, videoCallService_1.VideoCallService.endCall(call.id, currentUserId)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        console.error('Error during cleanup on page unload:', error_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        var handleVisibilityChange = function () { return __awaiter(_this, void 0, void 0, function () {
            var call, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(document.visibilityState === 'hidden')) return [3 /*break*/, 7];
                        call = currentCallRef.current;
                        if (!(call && !isCleaningUpRef.current)) return [3 /*break*/, 7];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        if (!(call.initiatorId !== currentUserId)) return [3 /*break*/, 3];
                        return [4 /*yield*/, videoCallService_1.VideoCallService.leaveCall(call.id, currentUserId)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, videoCallService_1.VideoCallService.endCall(call.id, currentUserId)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        cleanup();
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _a.sent();
                        console.error('Error during visibility change cleanup:', error_2);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return function () {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            // Cleanup finale al unmount
            var call = currentCallRef.current;
            if (call && !isCleaningUpRef.current) {
                videoCallService_1.VideoCallService.endCall(call.id, currentUserId)["catch"](console.error);
                cleanup();
            }
        };
    }, [currentUserId]);
    // CORREZIONE 3: Handler per inviti migliorato
    var handleCallInvitation = react_1.useCallback(function (message) {
        try {
            console.log('📞 Received call invitation:', message);
            if (message.type === 'CALL_INVITATION' && message.content) {
                var invitation = JSON.parse(message.content);
                // Verifica che l'invito sia per questo utente e non sia da lui stesso
                if (invitation.participantIds.includes(currentUserId) &&
                    invitation.initiatorId !== currentUserId) {
                    console.log('✅ Valid call invitation received');
                    setIncomingCall(invitation);
                }
            }
        }
        catch (error) {
            console.error('❌ Error parsing call invitation:', error);
        }
    }, [currentUserId]);
    // CORREZIONE 4: Handler eventi chiamata migliorato
    var handleCallEvent = react_1.useCallback(function (message) {
        try {
            if (message.type === 'CALL_EVENT' && message.content) {
                var event = JSON.parse(message.content);
                console.log('📡 Call event received:', event);
                switch (event.type) {
                    case 'participant-joined':
                        var joinedParticipant_1 = event.data;
                        if (joinedParticipant_1.userId !== currentUserId) {
                            console.log('👥 Remote participant joined:', joinedParticipant_1);
                            setParticipants(function (prev) {
                                var updated = __spreadArrays(prev.filter(function (p) { return p.userId !== joinedParticipant_1.userId; }), [joinedParticipant_1]);
                                return updated;
                            });
                            // Inizia connessione WebRTC con il nuovo partecipante
                            if (currentCall && currentCall.initiatorId === currentUserId) {
                                setTimeout(function () {
                                    createPeerConnectionAndOffer(joinedParticipant_1.userId, currentCall);
                                }, 1000);
                            }
                        }
                        break;
                    case 'participant-left':
                        var leftParticipant_1 = event.data;
                        console.log('👋 Participant left:', leftParticipant_1);
                        setParticipants(function (prev) { return prev.filter(function (p) { return p.userId !== leftParticipant_1.userId; }); });
                        WebRTCService_1.WebRTCService.closePeerConnection(leftParticipant_1.userId);
                        break;
                    case 'call-ended':
                        console.log('📞 Call ended by remote');
                        cleanup();
                        onCallEnd();
                        break;
                }
            }
        }
        catch (error) {
            console.error('❌ Error parsing call event:', error);
        }
    }, [currentUserId, currentCall, onCallEnd]);
    // CORREZIONE 5: Handler WebRTC signals con retry
    var handleWebRTCSignal = react_1.useCallback(function (message) { return __awaiter(_this, void 0, void 0, function () {
        var signal_1, _a, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 10, , 11]);
                    if (!(message.type === 'WEBRTC_SIGNAL' && message.content)) return [3 /*break*/, 9];
                    signal_1 = JSON.parse(message.content);
                    if (signal_1.toUserId !== currentUserId)
                        return [2 /*return*/];
                    console.log('🔄 Processing WebRTC signal:', signal_1.type, 'from:', signal_1.fromUserId);
                    if (!!WebRTCService_1.WebRTCService.getPeerConnection(signal_1.fromUserId)) return [3 /*break*/, 2];
                    console.log('🔗 Creating peer connection for incoming signal');
                    return [4 /*yield*/, WebRTCService_1.WebRTCService.createPeerConnection(signal_1.fromUserId, function (stream) { return setRemoteStream(signal_1.fromUserId, stream); }, function (candidate) { return sendIceCandidate(signal_1.fromUserId, candidate); })];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2:
                    _a = signal_1.type;
                    switch (_a) {
                        case 'offer': return [3 /*break*/, 3];
                        case 'answer': return [3 /*break*/, 5];
                        case 'ice-candidate': return [3 /*break*/, 7];
                    }
                    return [3 /*break*/, 9];
                case 3: return [4 /*yield*/, handleOffer(signal_1)];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 5: return [4 /*yield*/, handleAnswer(signal_1)];
                case 6:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, handleIceCandidate(signal_1)];
                case 8:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_3 = _b.sent();
                    console.error('❌ Error handling WebRTC signal:', error_3);
                    setError('Connection error: ' + error_3.message);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    }); }, [currentUserId]);
    // CORREZIONE 6: Gestione offer migliorata
    var handleOffer = function (signal) { return __awaiter(_this, void 0, void 0, function () {
        var peerId, stream, answer, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    peerId = signal.fromUserId;
                    console.log("\uD83D\uDCE4 Processing offer from " + peerId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    if (!!WebRTCService_1.WebRTCService.getLocalStream()) return [3 /*break*/, 3];
                    console.log('🎥 Initializing local stream for incoming offer...');
                    return [4 /*yield*/, WebRTCService_1.WebRTCService.initializeLocalStream(isVideoEnabled, !isMuted)];
                case 2:
                    stream = _a.sent();
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = stream;
                        localVideoRef.current.play()["catch"](console.error);
                    }
                    _a.label = 3;
                case 3: return [4 /*yield*/, WebRTCService_1.WebRTCService.handleRemoteOffer(peerId, signal.data)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, WebRTCService_1.WebRTCService.createAnswer(peerId)];
                case 5:
                    answer = _a.sent();
                    if (currentCall) {
                        sendWebRTCSignal('answer', currentCall.id, peerId, answer);
                    }
                    return [3 /*break*/, 7];
                case 6:
                    error_4 = _a.sent();
                    console.error("\u274C Error handling offer from " + peerId + ":", error_4);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleAnswer = function (signal) { return __awaiter(_this, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, WebRTCService_1.WebRTCService.handleRemoteAnswer(signal.fromUserId, signal.data)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    console.error("\u274C Error handling answer:", error_5);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleIceCandidate = function (signal) { return __awaiter(_this, void 0, void 0, function () {
        var error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, WebRTCService_1.WebRTCService.handleRemoteIceCandidate(signal.fromUserId, signal.data)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_6 = _a.sent();
                    console.error("\u274C Error handling ICE candidate:", error_6);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // CORREZIONE 7: Invio segnali WebRTC
    var sendWebRTCSignal = function (type, callId, toUserId, data) {
        var signal = {
            type: type,
            callId: callId,
            fromUserId: currentUserId,
            toUserId: toUserId,
            data: data
        };
        messageService_1.MessageService.sendMessage({
            content: JSON.stringify(signal),
            senderId: currentUserId,
            chatRoomId: chatId,
            type: 'WEBRTC_SIGNAL',
            timestamp: new Date().toISOString()
        });
    };
    var sendIceCandidate = function (toUserId, candidate) {
        if (currentCall) {
            sendWebRTCSignal('ice-candidate', currentCall.id, toUserId, candidate);
        }
    };
    // CORREZIONE 8: SetRemoteStream con retry e fallback
    var setRemoteStream = function (peerId, stream) {
        console.log("\uD83C\uDFA5 Setting remote stream for peer " + peerId);
        var trySetStream = function (attempt) {
            if (attempt === void 0) { attempt = 1; }
            var videoElement = remoteVideosRef.current.get(peerId);
            if (videoElement && stream && stream.getTracks().length > 0) {
                videoElement.srcObject = stream;
                videoElement.play()
                    .then(function () { return console.log("\u2705 Remote video playing for " + peerId); })["catch"](function (error) {
                    console.error("\u274C Error playing remote video for " + peerId + ":", error);
                    if (attempt < 3) {
                        setTimeout(function () { return trySetStream(attempt + 1); }, 1000 * attempt);
                    }
                });
                // Forza l'aggiornamento della UI
                videoElement.onloadedmetadata = function () {
                    console.log("\uD83C\uDFA5 Video metadata loaded for " + peerId);
                };
            }
            else if (attempt < 3) {
                setTimeout(function () { return trySetStream(attempt + 1); }, 500);
            }
        };
        trySetStream();
    };
    // CORREZIONE 9: Cleanup migliorato
    var cleanup = react_1.useCallback(function () {
        if (isCleaningUpRef.current)
            return;
        isCleaningUpRef.current = true;
        console.log('🧹 Cleaning up video call');
        WebRTCService_1.WebRTCService.closeAllConnections();
        subscriptionsRef.current.forEach(function (unsubscribe) { return unsubscribe(); });
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
    react_1.useEffect(function () {
        console.log('🔔 Setting up subscriptions for chat:', chatId);
        var unsubscribeChat = messageService_1.MessageService.subscribeToChat(chatId, function (message) {
            // Ignora i messaggi che inviamo noi stessi per evitare loop
            if (message.senderId === currentUserId)
                return;
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
        });
        subscriptionsRef.current.set('chat', unsubscribeChat);
        return function () {
            unsubscribeChat();
            cleanup();
        };
    }, [chatId, currentUserId, handleCallInvitation, handleCallEvent, handleWebRTCSignal, cleanup]);
    // CORREZIONE 11: StartCall completamente rivisto
    var startCall = function () { return __awaiter(_this, void 0, void 0, function () {
        var stream, call, invitation, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (isConnecting || isCallActive)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    console.log('📞 Starting call with participants:', participantIds);
                    setIsConnecting(true);
                    setError(null);
                    return [4 /*yield*/, WebRTCService_1.WebRTCService.initializeLocalStream(isVideoEnabled, !isMuted)];
                case 2:
                    stream = _a.sent();
                    if (!localVideoRef.current) return [3 /*break*/, 4];
                    localVideoRef.current.srcObject = stream;
                    return [4 /*yield*/, localVideoRef.current.play()];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [4 /*yield*/, videoCallService_1.VideoCallService.initiateCall({
                        initiatorId: currentUserId,
                        participantIds: participantIds,
                        type: participantIds.length === 1 ? 'ONE_TO_ONE' : 'GROUP'
                    })];
                case 5:
                    call = _a.sent();
                    setCurrentCall(call);
                    setIsCallActive(true);
                    invitation = {
                        id: call.id,
                        initiatorId: call.initiatorId,
                        participantIds: call.participantIds,
                        roomId: call.roomId,
                        type: call.type
                    };
                    messageService_1.MessageService.sendMessage({
                        content: JSON.stringify(invitation),
                        senderId: currentUserId,
                        chatRoomId: chatId,
                        type: 'CALL_INVITATION',
                        timestamp: new Date().toISOString()
                    });
                    console.log('🎉 Call started successfully');
                    return [3 /*break*/, 8];
                case 6:
                    error_7 = _a.sent();
                    console.error('❌ Error starting call:', error_7);
                    setError('Failed to start call: ' + error_7.message);
                    cleanup();
                    return [3 /*break*/, 8];
                case 7:
                    setIsConnecting(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // CORREZIONE 12: createPeerConnectionAndOffer migliorato
    var createPeerConnectionAndOffer = function (participantId, call) { return __awaiter(_this, void 0, void 0, function () {
        var offer, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    console.log("\uD83D\uDD17 Creating connection for " + participantId);
                    return [4 /*yield*/, WebRTCService_1.WebRTCService.createPeerConnection(participantId, function (stream) { return setRemoteStream(participantId, stream); }, function (candidate) { return sendIceCandidate(participantId, candidate); })];
                case 1:
                    _a.sent();
                    // Attendi che la connessione sia stabile
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 2:
                    // Attendi che la connessione sia stabile
                    _a.sent();
                    return [4 /*yield*/, WebRTCService_1.WebRTCService.createOffer(participantId)];
                case 3:
                    offer = _a.sent();
                    sendWebRTCSignal('offer', call.id, participantId, offer);
                    return [3 /*break*/, 5];
                case 4:
                    error_8 = _a.sent();
                    console.error("\u274C Error creating connection with " + participantId + ":", error_8);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // CORREZIONE 13: AcceptCall migliorato
    var acceptCall = function (call) { return __awaiter(_this, void 0, void 0, function () {
        var stream, peerId, videoCall, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, 6, 7]);
                    console.log('✅ Accepting call:', call.id);
                    setIsConnecting(true);
                    return [4 /*yield*/, WebRTCService_1.WebRTCService.initializeLocalStream(isVideoEnabled, !isMuted)];
                case 1:
                    stream = _a.sent();
                    if (!localVideoRef.current) return [3 /*break*/, 3];
                    localVideoRef.current.srcObject = stream;
                    return [4 /*yield*/, localVideoRef.current.play()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    peerId = "peer_" + currentUserId + "_" + Date.now();
                    return [4 /*yield*/, videoCallService_1.VideoCallService.joinCall(call.id, currentUserId, peerId)];
                case 4:
                    _a.sent();
                    videoCall = {
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
                    return [3 /*break*/, 7];
                case 5:
                    error_9 = _a.sent();
                    console.error('❌ Error accepting call:', error_9);
                    setError('Failed to accept call');
                    return [3 /*break*/, 7];
                case 6:
                    setIsConnecting(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var declineCall = function (call) { return __awaiter(_this, void 0, void 0, function () {
        var error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, videoCallService_1.VideoCallService.declineCall(call.id, currentUserId)];
                case 1:
                    _a.sent();
                    setIncomingCall(null);
                    return [3 /*break*/, 3];
                case 2:
                    error_10 = _a.sent();
                    console.error('❌ Error declining call:', error_10);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var endCall = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (isCleaningUpRef.current)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    if (!currentCall) return [3 /*break*/, 5];
                    if (!(currentCall.initiatorId === currentUserId)) return [3 /*break*/, 3];
                    return [4 /*yield*/, videoCallService_1.VideoCallService.endCall(currentCall.id, currentUserId)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, videoCallService_1.VideoCallService.leaveCall(currentCall.id, currentUserId)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6:
                    error_11 = _a.sent();
                    console.error('❌ Error ending call:', error_11);
                    return [3 /*break*/, 8];
                case 7:
                    cleanup();
                    onCallEnd();
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // CORREZIONE 14: Toggle functions corrette
    var toggleMute = function () { return __awaiter(_this, void 0, void 0, function () {
        var newMutedState, error_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    newMutedState = WebRTCService_1.WebRTCService.toggleMute();
                    setIsMuted(newMutedState);
                    if (!currentCall) return [3 /*break*/, 2];
                    return [4 /*yield*/, videoCallService_1.VideoCallService.updateMediaState(currentCall.id, currentUserId, newMutedState, isVideoEnabled)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [3 /*break*/, 4];
                case 3:
                    error_12 = _a.sent();
                    console.error('❌ Error toggling mute:', error_12);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var toggleVideo = function () { return __awaiter(_this, void 0, void 0, function () {
        var isVideoDisabled, newVideoState, error_13;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    isVideoDisabled = WebRTCService_1.WebRTCService.toggleVideo();
                    newVideoState = !isVideoDisabled;
                    setIsVideoEnabled(newVideoState);
                    if (!currentCall) return [3 /*break*/, 2];
                    return [4 /*yield*/, videoCallService_1.VideoCallService.updateMediaState(currentCall.id, currentUserId, isMuted, newVideoState)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [3 /*break*/, 4];
                case 3:
                    error_13 = _a.sent();
                    console.error('❌ Error toggling video:', error_13);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Render functions
    var renderIncomingCall = function () {
        if (!incomingCall)
            return null;
        return (React.createElement("div", { className: chatWindow_module_css_1["default"]["incoming-call-overlay"] },
            React.createElement("div", { className: chatWindow_module_css_1["default"]["incoming-call-box"] },
                React.createElement("div", { className: chatWindow_module_css_1["default"]["incoming-call-content"] },
                    React.createElement("h3", null, "Incoming Call"),
                    React.createElement("p", null,
                        "From: ",
                        incomingCall.initiatorId),
                    React.createElement("div", { className: chatWindow_module_css_1["default"]["incoming-call-buttons"] },
                        React.createElement("button", { onClick: function () { return declineCall(incomingCall); }, className: chatWindow_module_css_1["default"]["decline-btn"], disabled: isConnecting, style: { backgroundColor: '#dc3545', color: 'white', margin: '5px' } }, "Decline"),
                        React.createElement("button", { onClick: function () { return acceptCall(incomingCall); }, className: chatWindow_module_css_1["default"]["accept-btn"], disabled: isConnecting, style: { backgroundColor: '#28a745', color: 'white', margin: '5px' } }, isConnecting ? 'Accepting...' : 'Accept'))))));
    };
    var renderCallInterface = function () {
        if (!isCallActive)
            return null;
        return (React.createElement("div", { className: chatWindow_module_css_1["default"]["call-interface"] },
            React.createElement("div", { style: { position: 'fixed', top: '20px', right: '20px', zIndex: 1000 } },
                React.createElement("video", { ref: localVideoRef, autoPlay: true, playsInline: true, muted: true, style: {
                        width: '200px',
                        height: '150px',
                        objectFit: 'cover',
                        backgroundColor: '#000',
                        transform: 'scaleX(-1)',
                        border: '2px solid #007bff',
                        borderRadius: '8px'
                    } }),
                React.createElement("div", { style: { textAlign: 'center', color: 'white', fontSize: '12px' } },
                    "You ",
                    isMuted && '(Muted)',
                    " ",
                    !isVideoEnabled && '(No Video)')),
            React.createElement("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '10px',
                    padding: '20px',
                    height: '100vh',
                    backgroundColor: '#000'
                } },
                participants.map(function (participant) { return (React.createElement("div", { key: participant.userId, style: {
                        position: 'relative',
                        backgroundColor: '#333',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        minHeight: '300px'
                    } },
                    React.createElement("video", { ref: function (el) {
                            if (el) {
                                remoteVideosRef.current.set(participant.userId, el);
                                var existingStream = WebRTCService_1.WebRTCService.getRemoteStream(participant.userId);
                                if (existingStream) {
                                    el.srcObject = existingStream;
                                    el.play()["catch"](console.error);
                                }
                            }
                        }, autoPlay: true, playsInline: true, style: {
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        } }),
                    React.createElement("div", { style: {
                            position: 'absolute',
                            bottom: '10px',
                            left: '10px',
                            color: 'white',
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            fontSize: '14px'
                        } }, participant.userId))); }),
                participantIds.filter(function (id) {
                    return id !== currentUserId &&
                        !participants.some(function (p) { return p.userId === id; });
                }).map(function (participantId) { return (React.createElement("div", { key: "waiting-" + participantId, style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '300px',
                        backgroundColor: '#333',
                        borderRadius: '8px',
                        color: 'white'
                    } },
                    React.createElement("p", null,
                        "Waiting for ",
                        participantId,
                        "..."))); })),
            React.createElement("div", { style: {
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
                } },
                React.createElement("button", { onClick: toggleMute, style: {
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
                    } }, isMuted ? React.createElement(io5_1.IoMicOff, { size: 24 }) : React.createElement(io5_1.IoMic, { size: 24 })),
                React.createElement("button", { onClick: toggleVideo, style: {
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
                    } }, isVideoEnabled ? React.createElement(io5_1.IoVideocam, { size: 24 }) : React.createElement(io5_1.IoVideocamOff, { size: 24 })),
                React.createElement("button", { onClick: endCall, style: {
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
                    } },
                    React.createElement(io5_1.IoCallOutline, { size: 24 }),
                    "x")),
            error && (React.createElement("div", { style: {
                    position: 'fixed',
                    top: '20px',
                    left: '20px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    padding: '10px 15px',
                    borderRadius: '5px',
                    zIndex: 1000
                } },
                React.createElement("strong", null, "Error:"),
                " ",
                error,
                React.createElement("button", { onClick: function () { return setError(null); }, style: {
                        marginLeft: '10px',
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer'
                    } }, "\u00D7"))),
            isConnecting && (React.createElement("div", { style: {
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
                } },
                React.createElement("div", null, "Connecting...")))));
    };
    return (React.createElement(React.Fragment, null,
        !isCallActive && !incomingCall && (React.createElement("button", { onClick: startCall, disabled: isConnecting || participantIds.length === 0, style: {
                backgroundColor: participantIds.length === 0 ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '5px',
                cursor: participantIds.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
            } },
            React.createElement(io5_1.IoCall, { size: 20 }),
            React.createElement("span", null, isConnecting ? 'Starting...' : 'Start Call'))),
        renderIncomingCall(),
        renderCallInterface()));
}
exports["default"] = VideoCallComponent;
