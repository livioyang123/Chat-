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
// fe-chat/src/components/chat/ModalManageMembers.tsx - FIX COMPLETO
var react_1 = require("react");
var io5_1 = require("react-icons/io5");
var services_1 = require("@/services");
var modalManageMembers_module_css_1 = require("@/styles/modalManageMembers.module.css");
function ModalManageMembers(_a) {
    var _this = this;
    var chatId = _a.chatId, chatName = _a.chatName, currentMembers = _a.currentMembers, onClose = _a.onClose, onMembersUpdated = _a.onMembersUpdated;
    var _b = react_1.useState([]), members = _b[0], setMembers = _b[1];
    var _c = react_1.useState([]), friends = _c[0], setFriends = _c[1];
    var _d = react_1.useState(true), loading = _d[0], setLoading = _d[1];
    var _e = react_1.useState(''), searchTerm = _e[0], setSearchTerm = _e[1];
    var _f = react_1.useState(false), updating = _f[0], setUpdating = _f[1];
    react_1.useEffect(function () {
        var loadData = function () { return __awaiter(_this, void 0, void 0, function () {
            var memberPromises, membersData, allFriends, availableFriends, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, 4, 5]);
                        setLoading(true);
                        memberPromises = currentMembers.map(function (id) {
                            return services_1.UserService.getUserById(id).then(function (opt) { return opt; });
                        });
                        return [4 /*yield*/, Promise.all(memberPromises)];
                    case 1:
                        membersData = (_a.sent())
                            .filter(Boolean);
                        setMembers(membersData);
                        return [4 /*yield*/, services_1.UserService.getCurrentUserFriends()];
                    case 2:
                        allFriends = _a.sent();
                        availableFriends = allFriends.filter(function (friend) { return !currentMembers.includes(friend.id); });
                        setFriends(availableFriends);
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error loading data:', error_1);
                        return [3 /*break*/, 5];
                    case 4:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        loadData();
    }, [currentMembers]);
    // ✅ FIX: Aggiungi membro con aggiornamento stato
    var handleAddMember = function (userId) { return __awaiter(_this, void 0, void 0, function () {
        var addedFriend, newMembers, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (updating)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setUpdating(true);
                    // Chiama API backend
                    return [4 /*yield*/, services_1.ChatService.addParticipant(chatId, userId)];
                case 2:
                    // Chiama API backend
                    _a.sent();
                    addedFriend = friends.find(function (f) { return f.id === userId; });
                    if (addedFriend) {
                        newMembers = __spreadArrays(members, [addedFriend]);
                        setMembers(newMembers);
                        setFriends(function (prev) { return prev.filter(function (f) { return f.id !== userId; }); });
                        // ✅ Notifica al parent per refresh
                        onMembersUpdated(newMembers.map(function (m) { return m.id; }));
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error adding member:', error_2);
                    alert('Errore nell\'aggiunta del membro');
                    return [3 /*break*/, 5];
                case 4:
                    setUpdating(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // ✅ FIX: Rimuovi membro con aggiornamento stato
    var handleRemoveMember = function (userId) { return __awaiter(_this, void 0, void 0, function () {
        var removedMember_1, newMembers, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (updating)
                        return [2 /*return*/];
                    if (!confirm('Rimuovere questo membro dal gruppo?'))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setUpdating(true);
                    // Chiama API backend
                    return [4 /*yield*/, services_1.ChatService.removeParticipant(chatId, userId)];
                case 2:
                    // Chiama API backend
                    _a.sent();
                    removedMember_1 = members.find(function (m) { return m.id === userId; });
                    if (removedMember_1) {
                        newMembers = members.filter(function (m) { return m.id !== userId; });
                        setMembers(newMembers);
                        setFriends(function (prev) { return __spreadArrays(prev, [removedMember_1]); });
                        // ✅ Notifica al parent per refresh
                        onMembersUpdated(newMembers.map(function (m) { return m.id; }));
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error removing member:', error_3);
                    alert('Errore nella rimozione del membro');
                    return [3 /*break*/, 5];
                case 4:
                    setUpdating(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var filteredMembers = members.filter(function (m) {
        return m.username.toLowerCase().includes(searchTerm.toLowerCase());
    });
    var filteredFriends = friends.filter(function (f) {
        return f.username.toLowerCase().includes(searchTerm.toLowerCase());
    });
    return (React.createElement("div", { className: modalManageMembers_module_css_1["default"].overlay, onClick: onClose },
        React.createElement("div", { className: modalManageMembers_module_css_1["default"].modal, onClick: function (e) { return e.stopPropagation(); } },
            React.createElement("div", { className: modalManageMembers_module_css_1["default"].header },
                React.createElement("h2", { className: modalManageMembers_module_css_1["default"].title },
                    "Gestione Membri - ",
                    chatName),
                React.createElement("button", { className: modalManageMembers_module_css_1["default"].closeBtn, onClick: onClose, disabled: updating, title: "Chiudi finestra" },
                    React.createElement(io5_1.IoClose, null))),
            React.createElement("div", { className: modalManageMembers_module_css_1["default"].searchContainer },
                React.createElement("input", { type: "text", placeholder: "Cerca...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: modalManageMembers_module_css_1["default"].searchInput, disabled: updating })),
            React.createElement("div", { className: modalManageMembers_module_css_1["default"].content }, loading ? (React.createElement("div", { className: modalManageMembers_module_css_1["default"].loading }, "Caricamento...")) : (React.createElement(React.Fragment, null,
                React.createElement("div", { className: modalManageMembers_module_css_1["default"].section },
                    React.createElement("h3", { className: modalManageMembers_module_css_1["default"].sectionTitle },
                        "Membri Attuali (",
                        filteredMembers.length,
                        ")"),
                    React.createElement("div", { className: modalManageMembers_module_css_1["default"].memberList }, filteredMembers.map(function (member) { return (React.createElement("div", { key: member.id, className: modalManageMembers_module_css_1["default"].memberItem },
                        React.createElement("div", { className: modalManageMembers_module_css_1["default"].memberInfo },
                            React.createElement("div", { className: modalManageMembers_module_css_1["default"].avatar }, member.username.charAt(0).toUpperCase()),
                            React.createElement("span", { className: modalManageMembers_module_css_1["default"].username }, member.username)),
                        React.createElement("button", { className: modalManageMembers_module_css_1["default"].actionBtn + " " + modalManageMembers_module_css_1["default"].removeBtn, onClick: function () { return handleRemoveMember(member.id); }, disabled: updating, title: "Rimuovi dal gruppo" },
                            React.createElement(io5_1.IoRemove, null)))); }))),
                filteredFriends.length > 0 && (React.createElement("div", { className: modalManageMembers_module_css_1["default"].section },
                    React.createElement("h3", { className: modalManageMembers_module_css_1["default"].sectionTitle },
                        "Aggiungi Amici (",
                        filteredFriends.length,
                        ")"),
                    React.createElement("div", { className: modalManageMembers_module_css_1["default"].memberList }, filteredFriends.map(function (friend) { return (React.createElement("div", { key: friend.id, className: modalManageMembers_module_css_1["default"].memberItem },
                        React.createElement("div", { className: modalManageMembers_module_css_1["default"].memberInfo },
                            React.createElement("div", { className: modalManageMembers_module_css_1["default"].avatar }, friend.username.charAt(0).toUpperCase()),
                            React.createElement("span", { className: modalManageMembers_module_css_1["default"].username }, friend.username)),
                        React.createElement("button", { className: modalManageMembers_module_css_1["default"].actionBtn + " " + modalManageMembers_module_css_1["default"].addBtn, onClick: function () { return handleAddMember(friend.id); }, disabled: updating, title: "Aggiungi al gruppo" },
                            React.createElement(io5_1.IoAdd, null)))); }))))))))));
}
exports["default"] = ModalManageMembers;
