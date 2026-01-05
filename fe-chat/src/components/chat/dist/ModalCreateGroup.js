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
var gi_1 = require("react-icons/gi");
var services_1 = require("@/services");
var react_1 = require("react");
var services_2 = require("@/services");
var md_1 = require("react-icons/md");
var modalCreateGroup_module_css_1 = require("@/styles/modalCreateGroup.module.css");
function ModalCreateGroup(_a) {
    var _this = this;
    var onBtnClick = _a.onBtnClick, addChats = _a.addChats;
    var _b = react_1.useState([]), friends = _b[0], setFriends = _b[1];
    var _c = react_1.useState([]), selectedFriends = _c[0], setSelectedFriends = _c[1];
    var _d = react_1.useState(""), searchTerm = _d[0], setSearchTerm = _d[1];
    var _e = react_1.useState(true), loading = _e[0], setLoading = _e[1];
    var _f = react_1.useState(""), chatName = _f[0], setChatName = _f[1];
    var _g = react_1.useState(""), chatDescription = _g[0], setChatDescription = _g[1];
    react_1.useEffect(function () {
        var fetchFriends = function () { return __awaiter(_this, void 0, void 0, function () {
            var userFriends, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        setLoading(true);
                        return [4 /*yield*/, services_1.UserService.getCurrentUserFriends()];
                    case 1:
                        userFriends = _a.sent();
                        setFriends(userFriends);
                        return [3 /*break*/, 4];
                    case 2:
                        error_1 = _a.sent();
                        console.error("Errore nel caricamento degli amici:", error_1);
                        setFriends([]);
                        return [3 /*break*/, 4];
                    case 3:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        fetchFriends();
    }, []);
    var toggleFriendSelection = function (friendId) {
        setSelectedFriends(function (prevSelected) {
            return prevSelected.includes(friendId)
                ? prevSelected.filter(function (id) { return id !== friendId; })
                : __spreadArrays(prevSelected, [friendId]);
        });
    };
    var filteredFriends = (friends === null || friends === void 0 ? void 0 : friends.filter(function (friend) {
        return friend.username.toLowerCase().includes(searchTerm.toLowerCase());
    })) || [];
    var handleCreateGroup = function () { return __awaiter(_this, void 0, void 0, function () {
        var chat, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, services_2.ChatService.createChat(chatName, chatDescription, selectedFriends)];
                case 1:
                    chat = _a.sent();
                    addChats(chat);
                    onBtnClick(false);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error("Errore nella creazione del gruppo:", error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement("div", { className: modalCreateGroup_module_css_1["default"]["create-group-container"] },
        React.createElement("div", { className: modalCreateGroup_module_css_1["default"].icon, onClick: function () { return onBtnClick(false); } },
            React.createElement(gi_1.GiCrossMark, null)),
        React.createElement("div", { className: modalCreateGroup_module_css_1["default"].title }, "Aggiungi Membri"),
        React.createElement("div", { className: modalCreateGroup_module_css_1["default"]["group-info"] },
            React.createElement("div", { className: modalCreateGroup_module_css_1["default"]["info-name"] },
                React.createElement("label", { htmlFor: "name" }),
                React.createElement("input", { placeholder: "Nome del gruppo", type: "text", name: "name", id: "name", value: chatName, onChange: function (e) { return setChatName(e.target.value); } })),
            React.createElement("div", { className: modalCreateGroup_module_css_1["default"]["info-desc"] },
                React.createElement("input", { placeholder: "Descrizione del gruppo", type: "text", name: "description", id: "description", value: chatDescription, onChange: function (e) { return setChatDescription(e.target.value); } }))),
        React.createElement("div", { className: modalCreateGroup_module_css_1["default"]["search-input"] },
            React.createElement("input", { type: "text", placeholder: "Cerca membri...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); } })),
        selectedFriends.length > 0 && (React.createElement("div", { className: modalCreateGroup_module_css_1["default"]["selected-count"] },
            selectedFriends.length,
            " membri selezionati")),
        React.createElement("div", { className: modalCreateGroup_module_css_1["default"]["member-list"] }, loading ? (React.createElement("div", { className: modalCreateGroup_module_css_1["default"]["no-results"] }, "Caricamento amici...")) : filteredFriends.length > 0 ? (filteredFriends.map(function (friend) { return (React.createElement("div", { className: modalCreateGroup_module_css_1["default"]["member-item"], key: friend.id },
            React.createElement("div", { className: modalCreateGroup_module_css_1["default"].box, onClick: function () { return toggleFriendSelection(friend.id); } },
                React.createElement("input", { id: "select-friend-" + friend.id, type: "checkbox", checked: selectedFriends.includes(friend.id), readOnly: true, title: "Seleziona " + friend.username }),
                React.createElement("label", { htmlFor: "select-friend-" + friend.id }, friend.username)))); })) : (React.createElement("div", { className: modalCreateGroup_module_css_1["default"]["no-results"] }, searchTerm ? "Nessun amico trovato per la ricerca" : "Nessun amico disponibile"))),
        React.createElement("div", { className: modalCreateGroup_module_css_1["default"]["action-buttons"] }, selectedFriends.length > 0 &&
            React.createElement(md_1.MdOutlineDone, { onClick: handleCreateGroup, className: modalCreateGroup_module_css_1["default"]["create-btn"] }))));
}
exports["default"] = ModalCreateGroup;
