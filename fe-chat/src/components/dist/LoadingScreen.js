'use client';
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
var react_1 = require("react");
var loading_module_css_1 = require("@/styles/loading.module.css");
var services_1 = require("@/services");
var messageService_1 = require("@/services/messageService");
function LoadingScreen(_a) {
    var _this = this;
    var onComplete = _a.onComplete;
    var _b = react_1.useState(0), progress = _b[0], setProgress = _b[1];
    var _c = react_1.useState('Inizializzazione...'), status = _c[0], setStatus = _c[1];
    var isLoadingRef = react_1.useRef(false); // ✨ Previene doppio caricamento
    react_1.useEffect(function () {
        if (isLoadingRef.current)
            return; // ✨ Evita esecuzioni multiple
        isLoadingRef.current = true;
        var preloadData = function () { return __awaiter(_this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        // Step 1: Connessione WebSocket (0-30%)
                        setStatus('Connessione al server...');
                        return [4 /*yield*/, new Promise(function (resolve) { return messageService_1.MessageService.initializeWebSocket().then(resolve); })];
                    case 1:
                        _a.sent();
                        setProgress(30);
                        // Step 2: Caricamento chat (30-70%)
                        setStatus('Caricamento chat...');
                        return [4 /*yield*/, new Promise(function (resolve) { return services_1.ChatService.getUserChats().then(resolve); })];
                    case 2:
                        _a.sent();
                        setProgress(70);
                        // Step 3: Finalizzazione (70-100%)
                        setStatus('Quasi pronto...');
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                    case 3:
                        _a.sent();
                        setProgress(100);
                        // Completa il caricamento
                        setTimeout(function () { return onComplete(); }, 300);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('Errore durante il precaricamento:', error_1);
                        // Anche in caso di errore, completa il caricamento
                        setProgress(100);
                        setTimeout(function () { return onComplete(); }, 500);
                        onComplete();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        preloadData();
        return function () { isLoadingRef.current = false; };
    }, []);
    return (React.createElement("div", { className: loading_module_css_1["default"].loadingContainer },
        React.createElement("div", { className: loading_module_css_1["default"].animationArea },
            React.createElement("div", { className: loading_module_css_1["default"].sheepWalkContainer },
                React.createElement("div", { className: loading_module_css_1["default"].walkingSheep }, "\uD83D\uDC11"),
                React.createElement("div", { className: loading_module_css_1["default"].ground })),
            React.createElement("div", { className: loading_module_css_1["default"].loadingText }, status)),
        React.createElement("div", { className: loading_module_css_1["default"].progressBar },
            React.createElement("div", { className: loading_module_css_1["default"].progressFill, style: { width: progress + "%" } })),
        React.createElement("div", { className: loading_module_css_1["default"].progressText },
            progress,
            "%")));
}
exports["default"] = LoadingScreen;
