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
exports.AuthService = void 0;
//TODO : modify the code 
var api_1 = require("./api");
var AuthService = /** @class */ (function () {
    function AuthService() {
        this.userId = "";
        this.currentUser = "";
    }
    // Login
    AuthService.login = function (credentials) {
        return __awaiter(this, void 0, Promise, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.clearUserData(); // Pulisci i dati utente precedenti
                        return [4 /*yield*/, api_1.ApiService.post('/auth/login', credentials)];
                    case 1:
                        _a.sent();
                        this.saveUser(credentials.username, "currentUser");
                        this.getProfile(credentials.username);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('❌ POST', error_1);
                        throw new Error('Errore durante il login:');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Registrazione
    AuthService.register = function (userData) {
        return __awaiter(this, void 0, Promise, function () {
            var response, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, api_1.ApiService.post('/users/register', userData)];
                    case 1:
                        response = _b.sent();
                        // Con i cookie HTTP-only, il server imposta automaticamente i cookie
                        return [2 /*return*/, response.data];
                    case 2:
                        _a = _b.sent();
                        throw new Error('Errore durante la registrazione');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Logout
    AuthService.logout = function () {
        return __awaiter(this, void 0, Promise, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        // Il server rimuoverà automaticamente i cookie HTTP-only
                        return [4 /*yield*/, api_1.ApiService.post('/auth/logout')];
                    case 1:
                        // Il server rimuoverà automaticamente i cookie HTTP-only
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Errore durante il logout:', error_2);
                        return [3 /*break*/, 4];
                    case 3:
                        // Rimuovi solo i dati utente salvati localmente
                        this.clearUserData();
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Ottieni profilo utente aggiornato
    AuthService.getProfile = function (username) {
        return __awaiter(this, void 0, Promise, function () {
            var response, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, api_1.ApiService.get('/users/username/' + username)];
                    case 1:
                        response = _b.sent();
                        this.saveUser(response.id, username); // Salva l'ID utente e il nome utente
                        return [2 /*return*/, response];
                    case 2:
                        _a = _b.sent();
                        throw new Error('Errore nel recupero del profilo');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AuthService.clearUserData = function () {
        if (typeof window !== 'undefined') {
            sessionStorage.clear();
        }
    };
    //TODO : implementare metodo isAuthenticated
    //TODO : implementare il metodo per verificare il token JWT
    // Metodo di utilità per gestire errori di autenticazione
    AuthService.handleAuthError = function () {
        this.clearUserData();
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    };
    //TODO : func verify token
    AuthService.getUser = function (userId) {
        if (typeof window !== 'undefined') {
            return sessionStorage.getItem(userId);
        }
        return null;
    };
    AuthService.saveUser = function (username, userId) {
        sessionStorage.setItem(userId, username);
    };
    AuthService.getCurrentUser = function () {
        if (typeof window !== 'undefined') {
            return sessionStorage.getItem('currentUser');
        }
        return null;
    };
    AuthService.getCurrentUserId = function () {
        if (typeof window !== 'undefined') {
            var username = this.getCurrentUser();
            return sessionStorage.getItem(username || '');
        }
        return null;
    };
    return AuthService;
}());
exports.AuthService = AuthService;
