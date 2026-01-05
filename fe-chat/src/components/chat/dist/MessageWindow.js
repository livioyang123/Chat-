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
var io5_1 = require("react-icons/io5");
var image_1 = require("next/image");
var messageWindow_module_css_1 = require("@/styles/messageWindow.module.css");
var messageInput_module_css_1 = require("@/styles/messageInput.module.css");
var mediaModal_module_css_1 = require("@/styles/mediaModal.module.css");
var MAX_FILE_SIZE = 100 * 1024 * 1024;
var ALLOWED_FILE_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/mov'
];
function MessageWindow(_a) {
    var _this = this;
    var chatId = _a.chatId, chatName = _a.chatName, currentUserId = _a.currentUserId, chatParticipants = _a.chatParticipants;
    var _b = react_1.useState([]), messages = _b[0], setMessages = _b[1];
    var _c = react_1.useState(false), loading = _c[0], setLoading = _c[1];
    var _d = react_1.useState(null), error = _d[0], setError = _d[1];
    var _e = react_1.useState(''), newMessage = _e[0], setNewMessage = _e[1];
    var _f = react_1.useState(false), isConnected = _f[0], setIsConnected = _f[1];
    var _g = react_1.useState(null), selectedFile = _g[0], setSelectedFile = _g[1];
    var _h = react_1.useState(false), isUploading = _h[0], setIsUploading = _h[1];
    var _j = react_1.useState(null), filePreviewUrl = _j[0], setFilePreviewUrl = _j[1];
    var _k = react_1.useState(new Map()), typingUsers = _k[0], setTypingUsers = _k[1];
    var _l = react_1.useState(new Set()), onlineUsers = _l[0], setOnlineUsers = _l[1];
    // Modal state
    var _m = react_1.useState(null), modalMedia = _m[0], setModalMedia = _m[1];
    var messagesEndRef = react_1.useRef(null);
    var unsubscribeRef = react_1.useRef(null);
    var connectionCallbackRef = react_1.useRef(null);
    var fileInputRef = react_1.useRef(null);
    var typingTimeoutRef = react_1.useRef(null);
    var scrollToBottom = function () {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    };
    var formatTimestamp = function (timestamp) {
        var date = new Date(timestamp);
        return date.toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Europe/Rome'
        });
    };
    var formatFileSize = function (bytes) {
        if (bytes === 0)
            return '0 Bytes';
        var k = 1024;
        var sizes = ['Bytes', 'KB', 'MB', 'GB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    react_1.useEffect(function () {
        var initWebSocket = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, messageService_1.MessageService.initializeWebSocket()];
                    case 1:
                        _b.sent();
                        connectionCallbackRef.current = messageService_1.MessageService.onConnectionChange(setIsConnected);
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        setError('Errore connessione WebSocket');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        initWebSocket();
        return function () {
            var _a;
            (_a = connectionCallbackRef.current) === null || _a === void 0 ? void 0 : _a.call(connectionCallbackRef);
        };
    }, []);
    react_1.useEffect(function () {
        var _a;
        if (!chatId || !messageService_1.MessageService.isWebSocketConnected())
            return;
        (_a = unsubscribeRef.current) === null || _a === void 0 ? void 0 : _a.call(unsubscribeRef);
        try {
            unsubscribeRef.current = messageService_1.MessageService.subscribeToChat(chatId, function (message) {
                setMessages(function (prev) { return __spreadArrays(prev, [message]); });
            });
        }
        catch (error) {
            console.error('Errore sottoscrizione chat:', error);
        }
        return function () {
            var _a;
            (_a = unsubscribeRef.current) === null || _a === void 0 ? void 0 : _a.call(unsubscribeRef);
        };
    }, [chatId, isConnected]);
    react_1.useEffect(function () {
        if (!chatId) {
            setMessages([]);
            setError(null);
            return;
        }
        var loadMessages = function () { return __awaiter(_this, void 0, void 0, function () {
            var filters, response, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, 3, 4]);
                        setLoading(true);
                        setError(null);
                        filters = { chatId: chatId };
                        return [4 /*yield*/, messageService_1.MessageService.getChatMessages(filters)];
                    case 1:
                        response = _b.sent();
                        setMessages(response);
                        return [3 /*break*/, 4];
                    case 2:
                        _a = _b.sent();
                        setError('Errore nel caricamento dei messaggi');
                        setMessages([]);
                        return [3 /*break*/, 4];
                    case 3:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        loadMessages();
    }, [chatId]);
    react_1.useEffect(function () {
        if (!chatId || !messageService_1.MessageService.isWebSocketConnected())
            return;
        var unsubTyping = messageService_1.MessageService.subscribeToTyping(chatId, function (data) {
            var userId = data.userId, username = data.username, isTyping = data.isTyping;
            if (userId === currentUserId)
                return;
            setTypingUsers(function (prev) {
                var newMap = new Map(prev);
                if (isTyping && username) {
                    newMap.set(userId, username);
                }
                else {
                    newMap["delete"](userId);
                }
                return newMap;
            });
        });
        var unsubStatus = messageService_1.MessageService.subscribeToOnlineStatus(chatId, function (data) {
            var userId = data.userId, status = data.status;
            setOnlineUsers(function (prev) {
                var newSet = new Set(prev);
                if (status === 'online') {
                    newSet.add(userId);
                }
                else {
                    newSet["delete"](userId);
                }
                return newSet;
            });
        });
        messageService_1.MessageService.sendOnlineStatus(chatId, currentUserId, 'online');
        var heartbeat = setInterval(function () {
            messageService_1.MessageService.sendOnlineStatus(chatId, currentUserId, 'online');
        }, 20000);
        return function () {
            unsubTyping();
            unsubStatus();
            clearInterval(heartbeat);
            messageService_1.MessageService.sendOnlineStatus(chatId, currentUserId, 'offline');
        };
    }, [chatId, currentUserId]);
    var handleTyping = react_1.useCallback(function () {
        messageService_1.MessageService.sendTypingIndicator(chatId, currentUserId, true);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(function () {
            messageService_1.MessageService.sendTypingIndicator(chatId, currentUserId, false);
        }, 2000);
    }, [chatId, currentUserId]);
    var handleInputChange = function (e) {
        setNewMessage(e.target.value);
        handleTyping();
    };
    var renderTypingIndicator = function () {
        if (typingUsers.size === 0)
            return null;
        var names = Array.from(typingUsers.values());
        var text = names.length === 1
            ? names[0] + " sta scrivendo..."
            : names.length === 2
                ? names[0] + " e " + names[1] + " stanno scrivendo..."
                : names[0] + " e altri stanno scrivendo...";
        return (React.createElement("div", { className: messageWindow_module_css_1["default"]["typing-indicator"] },
            React.createElement("span", null, text),
            React.createElement("span", { className: messageWindow_module_css_1["default"]["typing-dots"] },
                React.createElement("span", null, "."),
                React.createElement("span", null, "."),
                React.createElement("span", null, "."))));
    };
    var onlineCount = onlineUsers.size - (onlineUsers.has(currentUserId) ? 1 : 0);
    react_1.useEffect(function () {
        scrollToBottom();
    }, [messages]);
    react_1.useEffect(function () {
        if (selectedFile) {
            var url_1 = URL.createObjectURL(selectedFile);
            setFilePreviewUrl(url_1);
            return function () { return URL.revokeObjectURL(url_1); };
        }
        else {
            setFilePreviewUrl(null);
        }
    }, [selectedFile]);
    var handleFileSelect = function (event) {
        var _a;
        var file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
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
    var removeSelectedFile = function () {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    var sendMessage = function () { return __awaiter(_this, void 0, void 0, function () {
        var messageData, fileUrl, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if ((!newMessage.trim() && !selectedFile) || !isConnected)
                        return [2 /*return*/];
                    setIsUploading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, 6, 7]);
                    messageData = void 0;
                    if (!selectedFile) return [3 /*break*/, 3];
                    return [4 /*yield*/, messageService_1.MessageService.uploadFile(selectedFile, chatId)];
                case 2:
                    fileUrl = (_b.sent()).url;
                    messageData = {
                        senderId: currentUserId,
                        chatRoomId: chatId,
                        content: newMessage.trim() || "",
                        type: selectedFile.type.startsWith('image/') ? 'IMAGE' : 'VIDEO',
                        fileUrl: fileUrl,
                        fileName: selectedFile.name
                    };
                    return [3 /*break*/, 4];
                case 3:
                    messageData = {
                        content: newMessage.trim(),
                        senderId: currentUserId,
                        chatRoomId: chatId,
                        type: 'CHAT'
                    };
                    _b.label = 4;
                case 4:
                    messageService_1.MessageService.sendMessage(messageData);
                    setNewMessage('');
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    return [3 /*break*/, 7];
                case 5:
                    _a = _b.sent();
                    setError('Errore nell\'invio del messaggio');
                    return [3 /*break*/, 7];
                case 6:
                    setIsUploading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleKeyPress = function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    // Handler per aprire il modal
    var openMediaModal = function (url, type) {
        setModalMedia({ url: url, type: type });
    };
    var closeMediaModal = function () {
        setModalMedia(null);
    };
    var renderImage = function (message) { return (React.createElement("div", { className: messageWindow_module_css_1["default"]["message-media"] },
        React.createElement("div", { className: messageWindow_module_css_1["default"]["message-image-container"], onClick: function () { return openMediaModal(message.fileUrl || '', 'image'); } },
            React.createElement("img", { src: message.fileUrl || "", alt: message.fileName || 'Immagine condivisa', className: messageWindow_module_css_1["default"]["message-image"] })),
        message.content && (React.createElement("div", { className: messageWindow_module_css_1["default"]["message-caption"] }, message.content)))); };
    var renderVideo = function (message) { return (React.createElement("div", { className: messageWindow_module_css_1["default"]["message-media"] },
        React.createElement("div", { className: messageWindow_module_css_1["default"]["message-video-container"], onClick: function () { return openMediaModal(message.fileUrl || '', 'video'); } },
            React.createElement("video", { className: messageWindow_module_css_1["default"]["message-video"], preload: "metadata", "aria-label": "Video: " + (message.fileName || 'Video condiviso') },
                React.createElement("source", { src: message.fileUrl, type: "video/mp4" }),
                React.createElement("source", { src: message.fileUrl, type: "video/webm" }),
                React.createElement("source", { src: message.fileUrl, type: "video/quicktime" })),
            React.createElement("div", { className: messageWindow_module_css_1["default"]["video-play-overlay"] }, "\u25B6")),
        message.content && (React.createElement("div", { className: messageWindow_module_css_1["default"]["message-caption"] }, message.content)))); };
    var renderMessageContent = function (message) {
        switch (message.type) {
            case 'IMAGE':
                return renderImage(message);
            case 'VIDEO':
                return renderVideo(message);
            default:
                return React.createElement("div", { className: messageWindow_module_css_1["default"]["message-text"] }, message.content);
        }
    };
    var renderFilePreview = function () {
        if (!selectedFile || !filePreviewUrl)
            return null;
        return (React.createElement("div", { className: messageInput_module_css_1["default"]["file-preview"] },
            React.createElement("div", { className: messageInput_module_css_1["default"]["preview-content"] },
                React.createElement("div", { className: messageInput_module_css_1["default"]["preview-media"] }, selectedFile.type.startsWith('image/') ? (React.createElement("div", { className: messageInput_module_css_1["default"]["preview-image-container"] },
                    React.createElement(image_1["default"], { src: filePreviewUrl, alt: "Anteprima immagine selezionata", width: 80, height: 80, className: messageInput_module_css_1["default"]["preview-image"], style: { objectFit: 'cover' } }))) : (React.createElement("video", { src: filePreviewUrl, className: messageInput_module_css_1["default"]["preview-video"], muted: true, "aria-label": "Anteprima video selezionato" }))),
                React.createElement("div", { className: messageInput_module_css_1["default"]["preview-info"] },
                    React.createElement("div", { className: messageInput_module_css_1["default"]["preview-filename"] }, selectedFile.name),
                    React.createElement("div", { className: messageInput_module_css_1["default"]["preview-filesize"] }, formatFileSize(selectedFile.size))),
                React.createElement("button", { onClick: removeSelectedFile, className: messageInput_module_css_1["default"]["preview-remove"], type: "button", title: "Rimuovi file selezionato", "aria-label": "Rimuovi file selezionato" },
                    React.createElement(io5_1.IoClose, null)))));
    };
    if (!chatId) {
        return React.createElement("div", { className: messageWindow_module_css_1["default"]["message-window"] }, "Seleziona una chat per iniziare");
    }
    if (loading) {
        return React.createElement("div", { className: messageWindow_module_css_1["default"]["message-window"] });
    }
    if (error && !messages.length) {
        return React.createElement("div", { className: messageWindow_module_css_1["default"]["message-window"] + " " + messageWindow_module_css_1["default"].error }, error);
    }
    var canSend = (newMessage.trim() || selectedFile) && isConnected && !isUploading;
    return (React.createElement("div", { className: messageWindow_module_css_1["default"]["message-window"] },
        React.createElement("div", { className: messageWindow_module_css_1["default"].messageHeader },
            React.createElement("span", null, chatName),
            React.createElement("div", { className: messageWindow_module_css_1["default"]["connection-status"] },
                chatParticipants.length > 2 && onlineCount > 0 && (React.createElement("span", { className: messageWindow_module_css_1["default"]["online-count"] },
                    onlineCount,
                    " online")),
                React.createElement("div", { className: messageWindow_module_css_1["default"]["status-indicator"] + " " + (isConnected ? messageWindow_module_css_1["default"].connected : messageWindow_module_css_1["default"].disconnected) }),
                React.createElement("span", { className: messageWindow_module_css_1["default"]["status-text"] }, isConnected ? 'Online' : 'Offline'))),
        React.createElement("div", { className: messageWindow_module_css_1["default"].messages },
            messages.length === 0 ? (React.createElement("div", { className: messageWindow_module_css_1["default"]["no-messages"] }, "Nessun messaggio in questa chat")) : (messages.map(function (message, index) { return (React.createElement("div", { key: index, className: messageWindow_module_css_1["default"].message + " " + (message.senderId === currentUserId ? messageWindow_module_css_1["default"]["message-own"] : messageWindow_module_css_1["default"]["message-other"]) },
                React.createElement("div", { className: messageWindow_module_css_1["default"]["message-meta"] },
                    React.createElement("span", { className: messageWindow_module_css_1["default"]["message-time"] }, message.timestamp ? formatTimestamp(message.timestamp) : '')),
                React.createElement("div", { className: messageWindow_module_css_1["default"]["message-content"] },
                    message.senderId !== currentUserId && (React.createElement("div", { className: messageWindow_module_css_1["default"]["message-sender"] }, message.senderId)),
                    renderMessageContent(message)))); })),
            React.createElement("div", { ref: messagesEndRef })),
        renderTypingIndicator(),
        renderFilePreview(),
        React.createElement("div", { id: messageInput_module_css_1["default"]["message-input"] },
            React.createElement("input", { type: "file", ref: fileInputRef, onChange: handleFileSelect, accept: "image/*,video/*", className: messageInput_module_css_1["default"]["hidden-file-input"], title: "Seleziona un file da allegare" }),
            React.createElement("button", { onClick: function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, className: messageInput_module_css_1["default"]["attach-button"], disabled: !isConnected || isUploading, type: "button", title: "Allega file", "aria-label": "Allega immagine o video" },
                React.createElement(io5_1.IoAttach, null)),
            React.createElement("input", { type: "text", value: newMessage, onChange: handleInputChange, onKeyPress: handleKeyPress, placeholder: selectedFile ? "Aggiungi una caption..." : "Scrivi un messaggio...", className: messageInput_module_css_1["default"]["message-input-field"], disabled: !isConnected || isUploading }),
            React.createElement("div", { id: messageInput_module_css_1["default"]["btnSend"], onClick: sendMessage, className: messageInput_module_css_1["default"]["send-button"] + " " + (!canSend ? messageInput_module_css_1["default"].disabled : ''), role: "button", tabIndex: 0, onKeyDown: function (e) {
                    if ((e.key === 'Enter' || e.key === ' ') && canSend) {
                        e.preventDefault();
                        sendMessage();
                    }
                }, "aria-label": "Invia messaggio", title: "Invia messaggio" }, isUploading ? '...' : React.createElement(io5_1.IoSendSharp, null))),
        !isConnected && (React.createElement("div", { className: messageWindow_module_css_1["default"]["connection-error"] }, "Connessione WebSocket non disponibile")),
        isUploading && (React.createElement("div", { className: messageWindow_module_css_1["default"]["upload-progress"] }, "Caricamento file in corso...")),
        error && (React.createElement("div", { className: messageWindow_module_css_1["default"]["error-message"] }, error)),
        modalMedia && (React.createElement("div", { className: mediaModal_module_css_1["default"]["media-modal"], onClick: closeMediaModal },
            React.createElement("div", { className: mediaModal_module_css_1["default"]["modal-close"] },
                React.createElement(io5_1.IoClose, null)),
            React.createElement("div", { className: mediaModal_module_css_1["default"]["modal-content"], onClick: function (e) { return e.stopPropagation(); } }, modalMedia.type === 'image' ? (React.createElement("img", { src: modalMedia.url, alt: "Immagine full screen", className: mediaModal_module_css_1["default"]["modal-image"] })) : (React.createElement("video", { src: modalMedia.url, controls: true, autoPlay: true, className: mediaModal_module_css_1["default"]["modal-video"] }, "Il tuo browser non supporta i video.")))))));
}
exports["default"] = MessageWindow;
