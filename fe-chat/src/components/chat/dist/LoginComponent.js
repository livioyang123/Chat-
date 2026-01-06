"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var services_1 = require("@/services");
var router_1 = require("next/router");
var axios_1 = require("axios");
var link_1 = require("next/link");
var LoadingScreen_1 = require("@/components/LoadingScreen");
var LoginComponent = function () {
    var _a = react_1.useState({
        username: '',
        password: ''
    }), formData = _a[0], setFormData = _a[1];
    var _b = react_1.useState(false), loading = _b[0], setLoading = _b[1];
    var _c = react_1.useState(false), showLoading = _c[0], setShowLoading = _c[1];
    var _d = react_1.useState(''), error = _d[0], setError = _d[1];
    var router = router_1.useRouter();
    react_1.useEffect(function () {
        router.prefetch('/chat');
        var timer = setTimeout(function () {
            router.prefetch('/register');
        }, 100);
        return function () { return clearTimeout(timer); };
    }, [router]);
    var handleChange = react_1.useCallback(function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = value, _a)));
        });
        // Pulisci errore quando l'utente modifica i campi
        if (error)
            setError('');
    }, [error]);
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var err_1, error_1, status;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    e.preventDefault();
                    setLoading(true);
                    setError('');
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, services_1.AuthService.login({
                            username: formData.username,
                            password: formData.password
                        })];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3:
                    _d.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, services_1.AuthService.getProfile(formData.username)];
                case 4:
                    _d.sent();
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _d.sent();
                    console.warn('Profile loading failed:', err_1);
                    return [3 /*break*/, 6];
                case 6:
                    // Mostra loading screen SOLO dopo login riuscito
                    setShowLoading(true);
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _d.sent();
                    console.log('Login error:', error_1);
                    setLoading(false); // Ferma loading immediatamente
                    // Gestione errore migliorata - resta nella pagina
                    if (axios_1["default"].isAxiosError(error_1)) {
                        status = (_a = error_1.response) === null || _a === void 0 ? void 0 : _a.status;
                        if (status === 401 || status === 400) {
                            setError('Username o password non corretti');
                        }
                        else if (status === 500) {
                            setError('Errore del server. Riprova più tardi.');
                        }
                        else {
                            setError(((_c = (_b = error_1.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || 'Errore di connessione');
                        }
                    }
                    else if (error_1 instanceof Error) {
                        setError(error_1.message);
                    }
                    else {
                        setError('Errore sconosciuto. Riprova.');
                    }
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var handleLoadingComplete = function () {
        setFormData({ username: "", password: "" });
        setLoading(false);
        router.replace('/chat');
    };
    // Mostra loading screen se sta caricando
    if (showLoading) {
        return React.createElement(LoadingScreen_1["default"], { onComplete: handleLoadingComplete });
    }
    return (React.createElement("div", { className: "login-container" },
        React.createElement("span", { className: "login-title" }, "Chat"),
        React.createElement("form", { onSubmit: handleSubmit, className: "login-form" },
            React.createElement("input", { type: "text", name: "username", placeholder: "Nome", value: formData.username, onChange: handleChange, required: true, autoComplete: "username", disabled: loading, className: "login-input" }),
            React.createElement("input", { type: "password", name: "password", placeholder: "Password", value: formData.password, onChange: handleChange, required: true, autoComplete: "current-password", disabled: loading, className: "login-input" }),
            React.createElement("button", { type: "submit", disabled: loading, className: "login-button" }, loading ? 'Accesso...' : 'Accedi'),
            error && (React.createElement("div", { className: "error-message", "aria-live": "polite" }, error))),
        React.createElement("div", { className: "register-link" },
            "Non hai un account? ",
            React.createElement(link_1["default"], { href: "/register", prefetch: true, className: 'a' }, "Registrati"))));
};
exports["default"] = LoginComponent;
