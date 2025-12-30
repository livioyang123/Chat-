"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.MessageService = void 0;
var stompjs_1 = require("@stomp/stompjs");
var sockjs_client_1 = require("sockjs-client");
var api_1 = require("@/services/api");
var MessageService = /** @class */ (function () {
    function MessageService() {
    }
    // Ottieni messaggi di una chat
    MessageService.getChatMessages = function (filters) {
        return __awaiter(this, void 0, Promise, function () {
            var chatId, otherFilters, params, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        chatId = filters.chatId, otherFilters = __rest(filters, ["chatId"]);
                        params = new URLSearchParams();
                        Object.entries(otherFilters).forEach(function (_a) {
                            var key = _a[0], value = _a[1];
                            if (value !== undefined) {
                                params.append(key, value.toString());
                            }
                        });
                        return [4 /*yield*/, api_1.ApiService.get("/messages/chatroom/" + chatId + "?" + params.toString())];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    // Elimina un messaggio
    MessageService.deleteMessage = function (messageId) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api_1.ApiService["delete"]("/messages/" + messageId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Cerca messaggi
    MessageService.searchMessages = function (chatId, query) {
        return __awaiter(this, void 0, Promise, function () {
            var params, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = new URLSearchParams({ q: query });
                        return [4 /*yield*/, api_1.ApiService.get("/chats/" + chatId + "/messages/search?" + params.toString())];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    };
    // Upload file/immagine
    MessageService.uploadFile = function (file, chatId) {
        return __awaiter(this, void 0, Promise, function () {
            var formData, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('📁 Starting file upload:', {
                            fileName: file.name,
                            fileSize: file.size,
                            fileType: file.type,
                            chatId: chatId
                        });
                        formData = new FormData();
                        formData.append('file', file);
                        formData.append('chatId', chatId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, api_1.ApiService.post('files/upload', formData, {
                                headers: { "Content-Type": 'multipart/form-data' }
                            })];
                    case 2:
                        response = _a.sent();
                        console.log('📤 Upload response received:', {
                            success: response.success,
                            hasData: !!response.data,
                            message: response.message
                        });
                        if (!response.success || !response.data) {
                            console.error('❌ Upload failed:', response.message);
                            throw new Error(response.message || 'Upload fallito');
                        }
                        console.log('✅ File uploaded successfully:', {
                            url: response.data.url,
                            type: response.data.type
                        });
                        return [2 /*return*/, response.data];
                    case 3:
                        error_1 = _a.sent();
                        console.error('❌ Upload error:', error_1);
                        if (error_1 instanceof Error) {
                            console.error('Error message:', error_1.message);
                            console.error('Error stack:', error_1.stack);
                        }
                        throw error_1 instanceof Error ? error_1 : new Error('Errore sconosciuto durante upload');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MessageService.debugChatMessages = function (chatId) {
        return __awaiter(this, void 0, Promise, function () {
            var messages, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('🔍 Debugging chat messages for chatId:', chatId);
                        return [4 /*yield*/, this.getChatMessages({ chatId: chatId })];
                    case 1:
                        messages = _a.sent();
                        console.log('📊 Chat debug info:', {
                            totalMessages: messages.length,
                            messageTypes: messages.reduce(function (acc, msg) {
                                var _a;
                                var typeKey = (_a = msg.type) !== null && _a !== void 0 ? _a : 'unknown';
                                acc[typeKey] = (acc[typeKey] || 0) + 1;
                                return acc;
                            }, {}),
                            messagesWithFiles: messages.filter(function (msg) { return msg.fileUrl; }).length,
                            recentMessages: messages.slice(-5).map(function (msg) { return ({
                                type: msg.type,
                                hasFileUrl: !!msg.fileUrl,
                                timestamp: msg.timestamp
                            }); })
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error('❌ Error debugging chat messages:', error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MessageService.subscribeToTyping = function (chatId, onTypingChange) {
        if (!this.stompClient || !this.isConnected) {
            throw new Error('WebSocket non connesso');
        }
        var subscription = this.stompClient.subscribe("/topic/chatroom/" + chatId + "/typing", function (message) {
            try {
                var data = JSON.parse(message.body);
                onTypingChange(data);
            }
            catch (error) {
                console.error('Error parsing typing indicator:', error);
            }
        });
        return function () { return subscription.unsubscribe(); };
    };
    // Subscribe to online status
    MessageService.subscribeToOnlineStatus = function (chatId, onStatusChange) {
        if (!this.stompClient || !this.isConnected) {
            throw new Error('WebSocket non connesso');
        }
        var subscription = this.stompClient.subscribe("/topic/chatroom/" + chatId + "/status", function (message) {
            try {
                var data = JSON.parse(message.body);
                onStatusChange(data);
            }
            catch (error) {
                console.error('Error parsing status update:', error);
            }
        });
        return function () { return subscription.unsubscribe(); };
    };
    // Send typing indicator
    MessageService.sendTypingIndicator = function (chatId, userId, isTyping) {
        if (!this.stompClient || !this.isConnected)
            return;
        var username = typeof window !== 'undefined' ? sessionStorage.getItem('currentUser') : null;
        var destination = isTyping ? '/app/chat.typing' : '/app/chat.stopTyping';
        this.stompClient.publish({
            destination: destination,
            body: JSON.stringify({
                chatRoomId: chatId,
                userId: userId,
                username: username
            })
        });
    };
    // Send online status
    MessageService.sendOnlineStatus = function (chatId, userId, status) {
        if (!this.stompClient || !this.isConnected)
            return;
        var destination = status === 'online' ? '/app/user.online' : '/app/user.offline';
        this.stompClient.publish({
            destination: destination,
            body: JSON.stringify({
                userId: userId,
                chatroomId: chatId
            })
        });
    };
    // ==================== WEBSOCKET METHODS - CORRETTI ====================
    // Inizializza connessione WebSocket
    MessageService.initializeWebSocket = function (serverUrl) {
        var _this = this;
        if (serverUrl === void 0) { serverUrl = 'http://localhost:8080/ws-chat'; }
        console.log('🔌 Initializing WebSocket connection to:', serverUrl);
        return new Promise(function (resolve, reject) {
            if (_this.stompClient && _this.isConnected) {
                console.log('✅ WebSocket already connected');
                resolve();
                return;
            }
            var socket = new sockjs_client_1["default"](serverUrl);
            _this.stompClient = new stompjs_1.Client({
                webSocketFactory: function () { return socket; },
                debug: function (str) {
                    console.log('🔧 STOMP Debug:', str);
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                onConnect: function (frame) {
                    console.log('✅ WebSocket connected successfully');
                    console.log('Connection frame:', frame);
                    _this.isConnected = true;
                    _this.notifyConnectionCallbacks(true);
                    resolve();
                },
                onDisconnect: function (frame) {
                    console.log('🔌 WebSocket disconnected');
                    console.log('Disconnect frame:', frame);
                    _this.isConnected = false;
                    _this.notifyConnectionCallbacks(false);
                },
                onStompError: function (frame) {
                    console.error('❌ STOMP Error:', frame);
                    _this.isConnected = false;
                    _this.notifyConnectionCallbacks(false);
                    reject(new Error("STOMP Error: " + frame.body));
                },
                onWebSocketError: function (error) {
                    console.error('❌ WebSocket Error:', error);
                    reject(error);
                }
            });
            try {
                _this.stompClient.activate();
                console.log('🔄 WebSocket activation initiated');
            }
            catch (error) {
                console.error('❌ Error activating WebSocket:', error);
                reject(error);
            }
        });
    };
    // Disconnetti WebSocket
    MessageService.disconnectWebSocket = function () {
        if (this.stompClient) {
            console.log('🔌 Disconnecting WebSocket...');
            this.stompClient.deactivate();
            this.stompClient = null;
            this.isConnected = false;
            this.subscriptions.clear();
            this.notifyConnectionCallbacks(false);
            console.log('✅ WebSocket disconnected');
        }
    };
    // Controlla se WebSocket è connesso
    MessageService.isWebSocketConnected = function () {
        var _a;
        return this.isConnected && ((_a = this.stompClient) === null || _a === void 0 ? void 0 : _a.connected) === true;
    };
    // CORREZIONE PRINCIPALE: Subscribe migliorata per gestire tutti i tipi di messaggio
    MessageService.subscribeToChat = function (chatId, onMessageReceived) {
        var _this = this;
        if (!this.stompClient || !this.isConnected) {
            console.error('❌ WebSocket not connected when trying to subscribe to chat:', chatId);
            throw new Error('WebSocket non connesso');
        }
        console.log('🔔 Subscribing to chat:', chatId);
        var subscription = this.stompClient.subscribe("/topic/chatroom/" + chatId, function (message) {
            var _a;
            try {
                console.log('📨 Raw WebSocket message received:', message.body);
                var receivedMessage = JSON.parse(message.body);
                console.log('✅ Parsed message successfully:', {
                    id: receivedMessage.chatRoomId,
                    type: receivedMessage.type,
                    senderId: receivedMessage.senderId,
                    chatRoomId: receivedMessage.chatRoomId,
                    content: ((_a = receivedMessage.content) === null || _a === void 0 ? void 0 : _a.substring(0, 100)) + '...',
                    fileUrl: receivedMessage.fileUrl,
                    fileName: receivedMessage.fileName,
                    timestamp: receivedMessage.timestamp
                });
                // CORREZIONE: Validazione migliorata del messaggio
                if (!receivedMessage.senderId || !receivedMessage.chatRoomId) {
                    console.warn('⚠️ Message missing required fields:', receivedMessage);
                    return; // Non processare messaggi malformati
                }
                // CORREZIONE: Validazione del tipo di messaggio
                var validTypes = ['TEXT', 'IMAGE', 'VIDEO', 'FILE', 'CALL_INVITATION', 'CALL_EVENT', 'WEBRTC_SIGNAL'];
                if (receivedMessage.type && !validTypes.includes(receivedMessage.type)) {
                    console.warn('⚠️ Unknown message type:', receivedMessage.type);
                }
                // CORREZIONE: Log specifico per messaggi di chiamata
                if (receivedMessage.type === 'CALL_INVITATION') {
                    console.log('📞 Received CALL_INVITATION message');
                }
                else if (receivedMessage.type === 'CALL_EVENT') {
                    console.log('📞 Received CALL_EVENT message');
                }
                else if (receivedMessage.type === 'WEBRTC_SIGNAL') {
                    console.log('🔄 Received WEBRTC_SIGNAL message');
                }
                onMessageReceived(receivedMessage);
            }
            catch (error) {
                console.error('❌ Error parsing WebSocket message:', error);
                console.error('Raw message body:', message.body);
            }
        });
        // Funzione di cleanup
        var unsubscribe = function () {
            console.log('🔇 Unsubscribing from chat:', chatId);
            subscription.unsubscribe();
            _this.subscriptions["delete"](chatId);
        };
        this.subscriptions.set(chatId, unsubscribe);
        console.log('✅ Successfully subscribed to chat:', chatId);
        return unsubscribe;
    };
    // CORREZIONE: Invia messaggio con validazione del tipo
    MessageService.sendMessage = function (message) {
        var _a, _b;
        if (!this.stompClient || !this.isConnected) {
            console.error('❌ Cannot send message - WebSocket not connected');
            throw new Error('WebSocket non connesso');
        }
        // CORREZIONE: Validazione del messaggio prima dell'invio
        if (!message.senderId || !message.chatRoomId) {
            console.error('❌ Message missing required fields:', message);
            throw new Error('Message must have senderId and chatRoomId');
        }
        // CORREZIONE: Assegna tipo di default se mancante
        if (!message.type) {
            if (message.fileUrl) {
                var fileExtension = (_a = message.fileUrl.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')) {
                    message.type = 'IMAGE';
                }
                else if (['mp4', 'avi', 'mov', 'wmv'].includes(fileExtension || '')) {
                    message.type = 'VIDEO';
                }
            }
            else {
                message.type = 'CHAT';
            }
        }
        console.log('📤 Sending message via WebSocket:', {
            destination: '/app/chat.sendMessage',
            messageType: message.type,
            senderId: message.senderId,
            chatRoomId: message.chatRoomId,
            hasContent: !!message.content,
            hasFileUrl: !!message.fileUrl,
            contentPreview: ((_b = message.content) === null || _b === void 0 ? void 0 : _b.substring(0, 50)) + (message.content && message.content.length > 50 ? '...' : ''),
            fileUrl: message.fileUrl,
            fileName: message.fileName
        });
        try {
            // CORREZIONE: Aggiungi timestamp se mancante
            var messageToSend = __assign(__assign({}, message), { timestamp: message.timestamp || new Date().toISOString() });
            this.stompClient.publish({
                destination: '/app/chat.sendMessage',
                body: JSON.stringify(messageToSend)
            });
            console.log('✅ Message published to WebSocket successfully');
        }
        catch (error) {
            console.error('❌ Error publishing message to WebSocket:', error);
            throw error;
        }
    };
    // AGGIUNTA: Metodo specifico per inviare inviti di chiamata
    MessageService.sendCallInvitation = function (chatId, senderId, invitation) {
        console.log('📞 Sending call invitation:', invitation);
        this.sendMessage({
            // ID sarà assegnato dal server
            content: JSON.stringify(invitation),
            senderId: senderId,
            chatRoomId: chatId,
            type: 'CALL_INVITATION',
            timestamp: new Date().toISOString()
        });
    };
    // AGGIUNTA: Metodo specifico per inviare eventi di chiamata
    MessageService.sendCallEvent = function (chatId, senderId, event) {
        console.log('📞 Sending call event:', event);
        this.sendMessage({
            content: JSON.stringify(event),
            senderId: senderId,
            chatRoomId: chatId,
            type: 'CALL_EVENT',
            timestamp: new Date().toISOString()
        });
    };
    // AGGIUNTA: Metodo specifico per inviare segnali WebRTC
    MessageService.sendWebRTCSignal = function (chatId, senderId, signal) {
        console.log('🔄 Sending WebRTC signal:', signal);
        this.sendMessage({
            content: JSON.stringify(signal),
            senderId: senderId,
            chatRoomId: chatId,
            type: 'WEBRTC_SIGNAL',
            timestamp: new Date().toISOString()
        });
    };
    // Registra callback per cambiamenti di stato connessione
    MessageService.onConnectionChange = function (callback) {
        var _this = this;
        this.connectionCallbacks.add(callback);
        // Chiama immediatamente con lo stato corrente
        callback(this.isConnected);
        // Restituisce funzione per rimuovere il callback
        return function () {
            _this.connectionCallbacks["delete"](callback);
        };
    };
    // Notifica tutti i callback del cambio di stato
    MessageService.notifyConnectionCallbacks = function (connected) {
        this.connectionCallbacks.forEach(function (callback) {
            try {
                callback(connected);
            }
            catch (error) {
                console.error('❌ Error in connection callback:', error);
            }
        });
    };
    // Pulisci tutte le sottoscrizioni per una chat
    MessageService.unsubscribeFromChat = function (chatId) {
        var unsubscribe = this.subscriptions.get(chatId);
        if (unsubscribe) {
            console.log('🔇 Unsubscribing from specific chat:', chatId);
            unsubscribe();
        }
        else {
            console.warn('⚠️ No subscription found for chat:', chatId);
        }
    };
    // Pulisci tutte le sottoscrizioni
    MessageService.unsubscribeAll = function () {
        console.log('🔇 Unsubscribing from all chats');
        this.subscriptions.forEach(function (unsubscribe, chatId) {
            console.log('🔇 Unsubscribing from chat:', chatId);
            unsubscribe();
        });
        this.subscriptions.clear();
    };
    // Ottieni lista delle chat sottoscritte
    MessageService.getSubscribedChats = function () {
        return Array.from(this.subscriptions.keys());
    };
    // AGGIUNTA: Metodo per verificare la salute della connessione
    MessageService.getConnectionHealth = function () {
        var _a, _b;
        return {
            isConnected: this.isConnected,
            subscriptions: this.subscriptions.size,
            clientState: ((_a = this.stompClient) === null || _a === void 0 ? void 0 : _a.connected) ? 'connected' :
                ((_b = this.stompClient) === null || _b === void 0 ? void 0 : _b.active) ? 'connecting' : 'disconnected'
        };
    };
    // AGGIUNTA: Metodo per forzare la riconnessione
    MessageService.forceReconnect = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🔄 Forcing WebSocket reconnection...');
                        if (this.stompClient) {
                            this.stompClient.deactivate();
                        }
                        // Attendi un momento prima di riconnettersi
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 1:
                        // Attendi un momento prima di riconnettersi
                        _a.sent();
                        return [2 /*return*/, this.initializeWebSocket()];
                }
            });
        });
    };
    MessageService.stompClient = null;
    MessageService.isConnected = false;
    MessageService.subscriptions = new Map();
    MessageService.connectionCallbacks = new Set();
    return MessageService;
}());
exports.MessageService = MessageService;
