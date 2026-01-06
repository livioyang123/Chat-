"use strict";
exports.__esModule = true;
// fe-chat/src/components/chat/ChatWindow.tsx - AGGIORNATO
var react_1 = require("react");
var io_1 = require("react-icons/io");
var ModalSettings_1 = require("@/components/ModalSettings");
var chatWindow_module_css_1 = require("@/styles/chatWindow.module.css");
var ChatList = react_1.lazy(function () { return Promise.resolve().then(function () { return require("./ChatList"); }); });
var MessageWindow = react_1.lazy(function () { return Promise.resolve().then(function () { return require("./MessageWindow"); }); });
var ChatListFallback = function () { return (React.createElement("div", { className: chatWindow_module_css_1["default"]["chat-list-fallback"] })); };
var MessageWindowFallback = function () { return (React.createElement("div", { className: chatWindow_module_css_1["default"]["message-window-fallback"] })); };
function ChatWindow() {
    var _a = react_1.useState(""), currentChat = _a[0], setCurrentChat = _a[1];
    var _b = react_1.useState(""), currentChatname = _b[0], setCurrentChatName = _b[1];
    var _c = react_1.useState(""), currentUserId = _c[0], setUserId = _c[1];
    var _d = react_1.useState([]), chatParticipants = _d[0], setChatParticipants = _d[1];
    var _e = react_1.useState(false), isInitialized = _e[0], setIsInitialized = _e[1];
    var _f = react_1.useState(false), showSettings = _f[0], setShowSettings = _f[1]; // ✨ NUOVO
    react_1.useEffect(function () {
        var userId = sessionStorage.getItem('currentUser');
        if (userId) {
            setUserId(userId);
            setIsInitialized(true);
        }
        else {
            var timer_1 = setTimeout(function () {
                var retryUserId = sessionStorage.getItem('currentUser');
                setUserId(retryUserId || "");
                setIsInitialized(true);
            }, 100);
            return function () { return clearTimeout(timer_1); };
        }
    }, []);
    var handleChatSelection = react_1.useCallback(function (chatId, chatName, participantIds) {
        setCurrentChat(chatId);
        setCurrentChatName(chatName);
        setChatParticipants(participantIds);
    }, []);
    if (!isInitialized) {
        return React.createElement("div", { className: chatWindow_module_css_1["default"]["window-container"] });
    }
    return (React.createElement("div", { className: chatWindow_module_css_1["default"]["window-container"] },
        React.createElement("div", { className: chatWindow_module_css_1["default"]["settings-container"] },
            React.createElement("div", { className: chatWindow_module_css_1["default"]["setting"] },
                React.createElement("button", { title: "Impostazioni", className: chatWindow_module_css_1["default"]["btnSetting"], onClick: function () { return setShowSettings(true); } },
                    React.createElement(io_1.IoIosSettings, null)))),
        React.createElement(react_1.Suspense, { fallback: React.createElement(ChatListFallback, null) },
            React.createElement(ChatList, { onButtonClick: handleChatSelection })),
        React.createElement(react_1.Suspense, { fallback: React.createElement(MessageWindowFallback, null) },
            React.createElement(MessageWindow, { chatId: currentChat, chatName: currentChatname, currentUserId: currentUserId, chatParticipants: chatParticipants })),
        showSettings && (React.createElement(ModalSettings_1["default"], { onClose: function () { return setShowSettings(false); } }))));
}
exports["default"] = ChatWindow;
