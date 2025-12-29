"use strict";
exports.__esModule = true;
var react_1 = require("react");
var io_1 = require("react-icons/io");
var chatWindow_module_css_1 = require("@/styles/chatWindow.module.css");
var im_1 = require("react-icons/im");
// Lazy loading dei componenti pesanti
var ChatList = react_1.lazy(function () { return Promise.resolve().then(function () { return require("./ChatList"); }); });
var MessageWindow = react_1.lazy(function () { return Promise.resolve().then(function () { return require("./MessageWindow"); }); });
// Componente di loading ottimizzato
var ChatSkeleton = function () { return (React.createElement("div", { className: chatWindow_module_css_1["default"]["window-container"] },
    React.createElement("div", { className: chatWindow_module_css_1["default"]["settings-container"] },
        React.createElement("div", { className: chatWindow_module_css_1["default"]["setting"] },
            React.createElement("button", { title: "Settings", className: chatWindow_module_css_1["default"]["btnSetting"] },
                React.createElement(io_1.IoIosSettings, null)),
            React.createElement("button", { title: "Settings", className: chatWindow_module_css_1["default"]["btnSetting"] },
                React.createElement(io_1.IoIosSettings, null)))),
    React.createElement("div", { className: chatWindow_module_css_1["default"]["chat-skeleton-layout"] },
        React.createElement("div", { className: chatWindow_module_css_1["default"]["chat-skeleton-sidebar"] },
            React.createElement("div", { className: chatWindow_module_css_1["default"]["skeleton-item"] }),
            React.createElement("div", { className: chatWindow_module_css_1["default"]["skeleton-item"] }),
            React.createElement("div", { className: chatWindow_module_css_1["default"]["skeleton-item"] })),
        React.createElement("div", { className: chatWindow_module_css_1["default"]["chat-skeleton-main"] },
            React.createElement("div", { className: chatWindow_module_css_1["default"]["skeleton-header"] }),
            React.createElement("div", { className: chatWindow_module_css_1["default"]["skeleton-content"] }))))); };
// Componenti di fallback per Suspense
var ChatListFallback = function () { return (React.createElement("div", { className: chatWindow_module_css_1["default"]["chat-list-fallback"] },
    "Caricamento chat... ",
    React.createElement(im_1.ImSpinner3, { className: "spinner" }))); };
var MessageWindowFallback = function () { return (React.createElement("div", { className: chatWindow_module_css_1["default"]["message-window-fallback"] },
    "Caricamento messaggi... ",
    React.createElement(im_1.ImSpinner3, { className: "spinner" }))); };
function ChatWindow() {
    var _a = react_1.useState(""), currentChat = _a[0], setCurrentChat = _a[1];
    var _b = react_1.useState(""), currentChatname = _b[0], setCurrentChatName = _b[1];
    var _c = react_1.useState(""), currentUserId = _c[0], setUserId = _c[1];
    var _d = react_1.useState([]), chatParticipants = _d[0], setChatParticipants = _d[1];
    var _e = react_1.useState(false), isInitialized = _e[0], setIsInitialized = _e[1];
    react_1.useEffect(function () {
        var initializeUser = function () {
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
        };
        initializeUser();
    }, []);
    var handleChatSelection = react_1.useCallback(function (chatId, chatName, participantIds) {
        setCurrentChat(chatId);
        setCurrentChatName(chatName);
        setChatParticipants(participantIds);
    }, []);
    if (!isInitialized) {
        return React.createElement(ChatSkeleton, null);
    }
    return (React.createElement("div", { className: chatWindow_module_css_1["default"]["window-container"] },
        React.createElement("div", { className: chatWindow_module_css_1["default"]["settings-container"] },
            React.createElement("div", { className: chatWindow_module_css_1["default"]["setting"] },
                React.createElement("button", { title: "Settings", className: chatWindow_module_css_1["default"]["btnSetting"] },
                    React.createElement(io_1.IoIosSettings, null)),
                React.createElement("button", { title: "Settings", className: chatWindow_module_css_1["default"]["btnSetting"] },
                    React.createElement(io_1.IoIosSettings, null)))),
        React.createElement(react_1.Suspense, { fallback: React.createElement(ChatListFallback, null) },
            React.createElement(ChatList, { onButtonClick: handleChatSelection })),
        React.createElement(react_1.Suspense, { fallback: React.createElement(MessageWindowFallback, null) },
            React.createElement(MessageWindow, { chatId: currentChat, chatName: currentChatname, currentUserId: currentUserId, chatParticipants: chatParticipants }))));
}
exports["default"] = ChatWindow;
