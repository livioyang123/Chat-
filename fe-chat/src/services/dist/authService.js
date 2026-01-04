"use strict";
// fe-chat/src/services/authService.ts - VERSIONE CORRETTA
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
exports.AuthService = void 0;
var api_1 = require("./api");
var AuthService = /** @class */ (function () {
    function AuthService() {
    }
    // CORREZIONE 1: Login migliorato con gestione errori dettagliata
    AuthService.login = function (credentials) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, Promise, function () {
            var response, error_1, axiosError;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        console.log('🔐 Attempting login with:', { username: credentials.username });
                        this.debugSessionStorage();
                        this.clearUserData(); // Pulisci i dati precedenti
                        return [4 /*yield*/, api_1.ApiService.post('/auth/login', credentials)];
                    case 1:
                        response = _e.sent();
                        console.log('✅ Login response:', response);
                        // CORREZIONE: Salva username e carica profilo
                        this.saveUser(credentials.username, "currentUser");
                        // Carica profilo utente per ottenere l'ID
                        return [4 /*yield*/, this.getProfile(credentials.username)];
                    case 2:
                        // Carica profilo utente per ottenere l'ID
                        _e.sent();
                        this.debugSessionStorage();
                        console.log('✅ Login successful');
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _e.sent();
                        console.error('❌ Login error:', error_1);
                        // CORREZIONE: Gestione errori più dettagliata
                        if (error_1 && typeof error_1 === 'object') {
                            axiosError = error_1;
                            if (((_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                                throw new Error('Credenziali non valide. Verifica username e password.');
                            }
                            else if (((_b = axiosError.response) === null || _b === void 0 ? void 0 : _b.status) === 500) {
                                throw new Error('Errore del server. Riprova più tardi.');
                            }
                            else if ((_d = (_c = axiosError.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.message) {
                                throw new Error(axiosError.response.data.message);
                            }
                        }
                        throw new Error('Errore durante il login. Verifica la connessione al server.');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Registrazione
    AuthService.register = function (userData) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, Promise, function () {
            var response, error_2, axiosError;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 2, , 3]);
                        console.log('📝 Attempting registration:', { username: userData.username, email: userData.email });
                        return [4 /*yield*/, api_1.ApiService.post('/users/register', userData)];
                    case 1:
                        response = _f.sent();
                        console.log('✅ Registration successful');
                        return [2 /*return*/, response];
                    case 2:
                        error_2 = _f.sent();
                        console.error('❌ Registration error:', error_2);
                        if (error_2 && typeof error_2 === 'object') {
                            axiosError = error_2;
                            if (((_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) === 400) {
                                throw new Error('Username già in uso');
                            }
                            else if (((_c = (_b = axiosError.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || ((_e = (_d = axiosError.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.msg)) {
                                throw new Error(axiosError.response.data.message || axiosError.response.data.msg);
                            }
                        }
                        throw new Error('Errore durante la registrazione');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Logout
    AuthService.logout = function () {
        return __awaiter(this, void 0, Promise, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        return [4 /*yield*/, api_1.ApiService.post('/auth/logout')];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Errore durante il logout:', error_3);
                        return [3 /*break*/, 4];
                    case 3:
                        this.clearUserData();
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // CORREZIONE 2: getProfile migliorato
    AuthService.getProfile = function (username) {
        return __awaiter(this, void 0, Promise, function () {
            var response, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('👤 Loading profile for:', username);
                        return [4 /*yield*/, api_1.ApiService.get('/users/username/' + username)];
                    case 1:
                        response = _a.sent();
                        console.log('✅ Profile loaded:', { id: response.id, username: response.username });
                        // Salva l'ID utente usando il suo username come chiave
                        this.saveUser(response.id, username);
                        return [2 /*return*/, response];
                    case 2:
                        error_4 = _a.sent();
                        console.error('❌ Error loading profile:', error_4);
                        throw new Error('Errore nel recupero del profilo');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // CORREZIONE 3: Utility methods migliorati
    AuthService.clearUserData = function () {
        if (typeof window !== 'undefined') {
            sessionStorage.clear();
            console.log('🧹 Session storage cleared');
        }
    };
    AuthService.handleAuthError = function () {
        this.clearUserData();
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    };
    AuthService.getUser = function (userId) {
        if (typeof window !== 'undefined') {
            return sessionStorage.getItem(userId);
        }
        return null;
    };
    AuthService.saveUser = function (value, key) {
        if (typeof window !== 'undefined') {
            try {
                // ✨ NUOVO: Pulizia chiave prima di salvare
                var existingValue = sessionStorage.getItem(key);
                if (existingValue && existingValue !== value) {
                    console.log("\uD83D\uDD04 Updating " + key + ": " + existingValue + " -> " + value);
                }
                sessionStorage.setItem(key, value);
                console.log("\uD83D\uDCBE Saved: " + key + " = " + value);
            }
            catch (error) {
                console.error('❌ SessionStorage error:', error);
                // Fallback: usa memoria temporanea se sessionStorage è pieno/bloccato
            }
        }
    };
    AuthService.getCurrentUser = function () {
        if (typeof window !== 'undefined') {
            var username = sessionStorage.getItem('currentUser');
            console.log('📖 Current user:', username);
            return username;
        }
        return null;
    };
    AuthService.getCurrentUserId = function () {
        if (typeof window !== 'undefined') {
            var username = this.getCurrentUser();
            if (!username)
                return null;
            var userId = sessionStorage.getItem(username);
            console.log('📖 Current user ID:', userId);
            return userId;
        }
        return null;
    };
    // CORREZIONE 4: Aggiungi metodo per verificare se l'utente è autenticato
    AuthService.isAuthenticated = function () {
        var username = this.getCurrentUser();
        var userId = this.getCurrentUserId();
        var isAuth = !!(username && userId);
        console.log('🔒 Is authenticated:', isAuth);
        return isAuth;
    };
    // ✨ NUOVO: Metodo per debug session storage
    AuthService.debugSessionStorage = function () {
        if (typeof window !== 'undefined') {
            console.log('📊 SessionStorage contents:');
            for (var i = 0; i < sessionStorage.length; i++) {
                var key = sessionStorage.key(i);
                if (key) {
                    console.log("  - " + key + ": " + sessionStorage.getItem(key));
                }
            }
        }
    };
    AuthService.userId = "";
    AuthService.currentUser = "";
    return AuthService;
}());
exports.AuthService = AuthService;
