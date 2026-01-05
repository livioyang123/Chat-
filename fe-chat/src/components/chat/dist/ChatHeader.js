"use strict";
exports.__esModule = true;
var react_1 = require("react");
var ai_1 = require("react-icons/ai");
var md_1 = require("react-icons/md");
var gi_1 = require("react-icons/gi");
var md_2 = require("react-icons/md");
var chatHeader_module_css_1 = require("@/styles/chatHeader.module.css");
function ChatHeader(_a) {
    var onBtnClick = _a.onBtnClick, onAddFriendClick = _a.onAddFriendClick;
    var _b = react_1.useState(false), open = _b[0], setOpen = _b[1];
    var dropdownRef = react_1.useRef(null);
    var logout = function () {
        window.location.href = "/";
    };
    react_1.useEffect(function () {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return function () { return document.removeEventListener('mousedown', handleClickOutside); };
    }, []);
    return (React.createElement("div", { className: chatHeader_module_css_1["default"]["chat-header"], ref: dropdownRef },
        React.createElement("h1", { className: chatHeader_module_css_1["default"][".h1"] }, "Chat"),
        React.createElement("div", { className: chatHeader_module_css_1["default"]["add-btn"], onClick: function () {
                onAddFriendClick(true);
                setOpen(false);
            } },
            React.createElement(md_2.MdOutlineAddCircleOutline, null)),
        React.createElement("div", { className: chatHeader_module_css_1["default"]["create-chat"], onClick: function () { return setOpen(!open); } },
            React.createElement(ai_1.AiOutlineMore, null)),
        open && (React.createElement("div", { className: chatHeader_module_css_1["default"]["dropdown-menu"] },
            React.createElement("div", { className: chatHeader_module_css_1["default"]["dropdown-item"], onClick: function () {
                    onBtnClick(true);
                    setOpen(false);
                } },
                React.createElement(md_1.MdGroups3, { className: chatHeader_module_css_1["default"]["icon"] }),
                React.createElement("div", { className: chatHeader_module_css_1["default"]["desc"] }, "nuovo gruppo")),
            React.createElement("div", { className: chatHeader_module_css_1["default"]["dropdown-item"], onClick: function () { return logout(); } },
                React.createElement(gi_1.GiAngelOutfit, { className: chatHeader_module_css_1["default"]["icon"] }),
                React.createElement("div", { className: chatHeader_module_css_1["default"]["desc"] }, "logout"))))));
}
exports["default"] = ChatHeader;
