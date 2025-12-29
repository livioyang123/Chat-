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
exports.ApiService = void 0;
var axios_1 = require("axios");
// Configurazione base
var API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
// Crea istanza Axios
var apiClient = axios_1["default"].create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});
// Interceptor per le richieste
apiClient.interceptors.request.use(function (config) {
    var _a;
    // Log delle richieste in development
    if (process.env.NODE_ENV === 'development') {
        console.log("\uD83D\uDE80 " + ((_a = config.method) === null || _a === void 0 ? void 0 : _a.toUpperCase()) + " " + config.url, config.data);
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});
// Interceptor per le risposte
apiClient.interceptors.response.use(function (response) {
    var _a;
    if (process.env.NODE_ENV === 'development') {
        console.log("\u2705 " + ((_a = response.config.method) === null || _a === void 0 ? void 0 : _a.toUpperCase()) + " " + response.config.url, response.data);
    }
    return response;
}, function (error) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (process.env.NODE_ENV === 'development') {
        console.error("\u274C " + ((_b = (_a = error.config) === null || _a === void 0 ? void 0 : _a.method) === null || _b === void 0 ? void 0 : _b.toUpperCase()) + " " + ((_c = error.config) === null || _c === void 0 ? void 0 : _c.url), (_d = error.response) === null || _d === void 0 ? void 0 : _d.data);
    }
    // Gestione errori globali
    if (((_e = error.response) === null || _e === void 0 ? void 0 : _e.status) === 401) {
        console.error('Token scaduto o non valido, redirect al login');
        // Puoi decidere se fare redirect automatico o gestire diversamente
        // window.location.href = '/login';
    }
    if (((_f = error.response) === null || _f === void 0 ? void 0 : _f.status) === 403) {
        console.error('Accesso negato');
    }
    if (((_g = error.response) === null || _g === void 0 ? void 0 : _g.status) >= 500) {
        console.error('Errore del server');
    }
    return Promise.reject(error);
});
// Classe wrapper per metodi HTTP comuni
var ApiService = /** @class */ (function () {
    function ApiService() {
    }
    ApiService.get = function (url, config) {
        return __awaiter(this, void 0, Promise, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiClient.get(url, config)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    };
    ApiService.post = function (url, data, config) {
        return __awaiter(this, void 0, Promise, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiClient.post(url, data, config)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    };
    ApiService.put = function (url, data, config) {
        return __awaiter(this, void 0, Promise, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiClient.put(url, data, config)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    };
    ApiService.patch = function (url, data, config) {
        return __awaiter(this, void 0, Promise, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiClient.patch(url, data, config)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    };
    ApiService["delete"] = function (url, config) {
        return __awaiter(this, void 0, Promise, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiClient["delete"](url, config)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    };
    ApiService.logout = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiClient.post('/auth/logout')];
                    case 1:
                        _a.sent();
                        // Reindirizza dopo il logout
                        window.location.href = '/login';
                        return [2 /*return*/];
                }
            });
        });
    };
    return ApiService;
}());
exports.ApiService = ApiService;
exports["default"] = apiClient;
