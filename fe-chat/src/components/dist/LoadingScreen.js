// MODIFICA COMPLETA: fe-chat/src/components/LoadingScreen.tsx
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
var gsap_1 = require("gsap");
var loading_module_css_1 = require("@/styles/loading.module.css");
var services_1 = require("@/services");
var messageService_1 = require("@/services/messageService");
function LoadingScreen(_a) {
    var _this = this;
    var onComplete = _a.onComplete;
    var _b = react_1.useState(0), progress = _b[0], setProgress = _b[1];
    var isLoadingRef = react_1.useRef(false);
    var gridRef = react_1.useRef(null);
    var sparkContainerRef = react_1.useRef(null);
    // ✨ Animazione Grid Scan
    react_1.useEffect(function () {
        if (!gridRef.current)
            return;
        var grid = gridRef.current;
        var cells = grid.querySelectorAll("." + loading_module_css_1["default"].gridCell);
        // Animazione scan continua
        gsap_1.gsap.to(cells, {
            opacity: 0.8,
            scale: 1.05,
            stagger: {
                amount: 2,
                from: 'random',
                repeat: -1,
                yoyo: true
            },
            duration: 0.5,
            ease: 'power2.inOut'
        });
        // Scan line orizzontale
        var scanLine = grid.querySelector("." + loading_module_css_1["default"].scanLine);
        if (scanLine) {
            gsap_1.gsap.to(scanLine, {
                y: '100vh',
                duration: 2,
                repeat: -1,
                ease: 'none'
            });
        }
    }, []);
    // ✨ Click Spark Effect
    react_1.useEffect(function () {
        var handleClick = function (e) {
            if (!sparkContainerRef.current)
                return;
            var spark = document.createElement('div');
            spark.className = loading_module_css_1["default"].clickSpark;
            spark.style.left = e.clientX + "px";
            spark.style.top = e.clientY + "px";
            sparkContainerRef.current.appendChild(spark);
            // Animazione con GSAP
            gsap_1.gsap.to(spark, {
                scale: 2,
                opacity: 0,
                duration: 0.6,
                ease: 'power2.out',
                onComplete: function () {
                    spark.remove();
                }
            });
            var _loop_1 = function (i) {
                var particle = document.createElement('div');
                particle.className = loading_module_css_1["default"].sparkParticle;
                particle.style.left = e.clientX + "px";
                particle.style.top = e.clientY + "px";
                sparkContainerRef.current.appendChild(particle);
                var angle = (Math.PI * 2 * i) / 6;
                var distance = 50 + Math.random() * 30;
                var x = Math.cos(angle) * distance;
                var y = Math.sin(angle) * distance;
                gsap_1.gsap.to(particle, {
                    x: x,
                    y: y,
                    opacity: 0,
                    scale: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                    onComplete: function () {
                        particle.remove();
                    }
                });
            };
            // Spark particles
            for (var i = 0; i < 6; i++) {
                _loop_1(i);
            }
        };
        document.addEventListener('click', handleClick);
        return function () { return document.removeEventListener('click', handleClick); };
    }, []);
    // Preload data (mantieni logica originale)
    react_1.useEffect(function () {
        if (isLoadingRef.current)
            return;
        isLoadingRef.current = true;
        var preloadData = function () { return __awaiter(_this, void 0, void 0, function () {
            var chatError_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        setProgress(10);
                        return [4 /*yield*/, messageService_1.MessageService.initializeWebSocket()];
                    case 1:
                        _a.sent();
                        setProgress(40);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, services_1.ChatService.getUserChats()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        chatError_1 = _a.sent();
                        console.warn('No chats found (new user):', chatError_1);
                        return [3 /*break*/, 5];
                    case 5:
                        setProgress(90);
                        setProgress(100);
                        setTimeout(function () { return onComplete(); }, 100);
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        console.error('Critical error during preload:', error_1);
                        setProgress(100);
                        setTimeout(function () { return onComplete(); }, 200);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        preloadData();
        return function () {
            isLoadingRef.current = false;
        };
    }, [onComplete]);
    return (React.createElement("div", { className: loading_module_css_1["default"].loadingContainer },
        React.createElement("div", { ref: gridRef, className: loading_module_css_1["default"].gridBackground },
            Array.from({ length: 100 }).map(function (_, i) { return (React.createElement("div", { key: i, className: loading_module_css_1["default"].gridCell })); }),
            React.createElement("div", { className: loading_module_css_1["default"].scanLine })),
        React.createElement("div", { ref: sparkContainerRef, className: loading_module_css_1["default"].sparkContainer }),
        React.createElement("div", { className: loading_module_css_1["default"].content },
            React.createElement("h1", { className: loading_module_css_1["default"].title }, "Loading"),
            React.createElement("div", { className: loading_module_css_1["default"].progressBar },
                React.createElement("div", { className: loading_module_css_1["default"].progressFill, style: { width: progress + "%" } })),
            React.createElement("div", { className: loading_module_css_1["default"].progressText },
                progress,
                "%"))));
}
exports["default"] = LoadingScreen;
