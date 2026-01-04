"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var react_1 = require("react");
var errorBoundary_module_css_1 = require("@/styles/errorBoundary.module.css");
var ErrorBoundary = /** @class */ (function (_super) {
    __extends(ErrorBoundary, _super);
    function ErrorBoundary(props) {
        var _this = _super.call(this, props) || this;
        _this.handleReset = function () {
            _this.setState({
                hasError: false,
                error: null,
                errorInfo: null
            });
        };
        _this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
        return _this;
    }
    ErrorBoundary.getDerivedStateFromError = function (error) {
        return {
            hasError: true,
            error: error,
            errorInfo: null
        };
    };
    ErrorBoundary.prototype.componentDidCatch = function (error, errorInfo) {
        console.error('🚨 ErrorBoundary caught:', error);
        console.error('📍 Component stack:', errorInfo.componentStack);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        // Log to external monitoring service
        if (process.env.NODE_ENV === 'production') {
            // Example: logErrorToService(error, errorInfo);
        }
    };
    ErrorBoundary.prototype.render = function () {
        var _a;
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (react_1["default"].createElement("div", { className: errorBoundary_module_css_1["default"].errorContainer },
                react_1["default"].createElement("div", { className: errorBoundary_module_css_1["default"].errorCard },
                    react_1["default"].createElement("h1", { className: errorBoundary_module_css_1["default"].errorTitle }, "\u26A0\uFE0F Qualcosa \u00E8 andato storto"),
                    react_1["default"].createElement("p", { className: errorBoundary_module_css_1["default"].errorMessage }, "Si \u00E8 verificato un errore imprevisto. Lapplicazione continuer\u00E0 a funzionare."),
                    process.env.NODE_ENV === 'development' && this.state.error && (react_1["default"].createElement("details", { className: errorBoundary_module_css_1["default"].errorDetails },
                        react_1["default"].createElement("summary", null, "Dettagli tecnici (solo dev)"),
                        react_1["default"].createElement("pre", { className: errorBoundary_module_css_1["default"].errorStack },
                            this.state.error.toString(), (_a = this.state.errorInfo) === null || _a === void 0 ? void 0 :
                            _a.componentStack))),
                    react_1["default"].createElement("div", { className: errorBoundary_module_css_1["default"].errorActions },
                        react_1["default"].createElement("button", { onClick: this.handleReset, className: errorBoundary_module_css_1["default"].retryButton }, "\uD83D\uDD04 Riprova"),
                        react_1["default"].createElement("button", { onClick: function () { return window.location.reload(); }, className: errorBoundary_module_css_1["default"].reloadButton }, "\uD83D\uDD03 Ricarica Pagina")))));
        }
        return this.props.children;
    };
    return ErrorBoundary;
}(react_1.Component));
exports["default"] = ErrorBoundary;
