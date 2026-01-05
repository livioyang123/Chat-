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
exports.__esModule = true;
var gi_1 = require("react-icons/gi");
var services_1 = require("@/services");
var react_1 = require("react");
var modalAddFriend_module_css_1 = require("@/styles/modalAddFriend.module.css");
function ModalAddFriend(_a) {
    var _this = this;
    var onAddFriendClick = _a.onAddFriendClick;
    var _b = react_1.useState(""), searchTerm = _b[0], setSearchTerm = _b[1];
    var _c = react_1.useState([]), searchResults = _c[0], setSearchResults = _c[1];
    var _d = react_1.useState(false), loading = _d[0], setLoading = _d[1];
    var _e = react_1.useState([]), friends = _e[0], setFriends = _e[1];
    react_1.useEffect(function () {
        var fetchCurrentFriends = function () { return __awaiter(_this, void 0, void 0, function () {
            var userFriends, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, services_1.UserService.getCurrentUserFriends()];
                    case 1:
                        userFriends = _a.sent();
                        setFriends(userFriends);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error("Errore nel caricamento degli amici:", error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        fetchCurrentFriends();
    }, []);
    var handleSearch = react_1.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var results, filteredResults, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!searchTerm.trim()) {
                        setSearchResults([]);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, services_1.UserService.searchUsers(searchTerm)];
                case 2:
                    results = _a.sent();
                    filteredResults = results.filter(function (user) {
                        return !friends.some(function (friend) { return friend.id === user.id; });
                    });
                    setSearchResults(filteredResults);
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error("Errore nella ricerca degli utenti:", error_2);
                    setSearchResults([]);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [searchTerm, friends]);
    var handleSendFriendRequest = function (userId) { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, services_1.UserService.sendFriendRequest(userId)];
                case 1:
                    _a.sent();
                    setSearchResults(function (prev) { return prev.filter(function (user) { return user.id !== userId; }); });
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error("Errore nell'invio della richiesta di amicizia:", error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    react_1.useEffect(function () {
        var timeoutId = setTimeout(function () {
            handleSearch();
        }, 500);
        return function () { return clearTimeout(timeoutId); };
    }, [searchTerm, handleSearch]);
    var isAlreadyFriend = function (userId) {
        return friends.some(function (friend) { return friend.id === userId; });
    };
    return (React.createElement("div", { className: modalAddFriend_module_css_1["default"]["create-group-container"] },
        React.createElement("div", { className: modalAddFriend_module_css_1["default"].icon, onClick: function () { return onAddFriendClick(false); } },
            React.createElement(gi_1.GiCrossMark, null)),
        React.createElement("div", { className: modalAddFriend_module_css_1["default"].title }, "Aggiungi Amico"),
        React.createElement("div", { className: modalAddFriend_module_css_1["default"]["search-input"] },
            React.createElement("input", { type: "text", placeholder: "Cerca utenti per username...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); } })),
        React.createElement("div", { className: modalAddFriend_module_css_1["default"]["member-list"] }, loading ? (React.createElement("div", { className: modalAddFriend_module_css_1["default"]["no-results"] }, "Ricerca in corso...")) : searchResults.length > 0 ? (searchResults.map(function (user) { return (React.createElement("div", { className: modalAddFriend_module_css_1["default"]["member-item"], key: user.id },
            React.createElement("div", { className: modalAddFriend_module_css_1["default"]["user-info"] },
                React.createElement("div", { className: modalAddFriend_module_css_1["default"].username }, user.username),
                React.createElement("div", { className: modalAddFriend_module_css_1["default"]["user-actions"] }, isAlreadyFriend(user.id) ? (React.createElement("button", { className: modalAddFriend_module_css_1["default"]["already-friend-btn"], disabled: true }, "Gi\u00E0 amico"))
                    : (React.createElement("button", { onClick: function () { return handleSendFriendRequest(user.id); }, className: modalAddFriend_module_css_1["default"]["add-friend-btn"] }, "Aggiungi")))))); })) : searchTerm ? (React.createElement("div", { className: modalAddFriend_module_css_1["default"]["no-results"] }, "Nessun utente trovato per la ricerca")) : (React.createElement("div", { className: modalAddFriend_module_css_1["default"]["no-results"] }, "Inserisci un username per cercare nuovi amici")))));
}
exports["default"] = ModalAddFriend;
