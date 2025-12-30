// src/components/LoadingScreen.tsx
'use client';
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var loading_module_css_1 = require("@/styles/loading.module.css");
function LoadingScreen(_a) {
    var onComplete = _a.onComplete;
    var _b = react_1.useState(0), progress = _b[0], setProgress = _b[1];
    react_1.useEffect(function () {
        var interval = setInterval(function () {
            setProgress(function (prev) {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(function () { return onComplete(); }, 500);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
        return function () { return clearInterval(interval); };
    }, [onComplete]);
    return (React.createElement("div", { className: loading_module_css_1["default"].loadingContainer },
        React.createElement("div", { className: loading_module_css_1["default"].animationArea },
            React.createElement("div", { className: loading_module_css_1["default"].sheepContainer },
                React.createElement("div", { className: loading_module_css_1["default"].sheep },
                    React.createElement("div", { className: loading_module_css_1["default"].sheepBody }, "\uD83D\uDC11"),
                    React.createElement("div", { className: loading_module_css_1["default"].grass }, "\uD83C\uDF3F")),
                React.createElement("div", { className: loading_module_css_1["default"].sheep + " " + loading_module_css_1["default"].sheep2 },
                    React.createElement("div", { className: loading_module_css_1["default"].sheepBody }, "\uD83D\uDC11"),
                    React.createElement("div", { className: loading_module_css_1["default"].grass }, "\uD83C\uDF3F")),
                React.createElement("div", { className: loading_module_css_1["default"].sheep + " " + loading_module_css_1["default"].sheep3 },
                    React.createElement("div", { className: loading_module_css_1["default"].sheepBody }, "\uD83D\uDC11"),
                    React.createElement("div", { className: loading_module_css_1["default"].grass }, "\uD83C\uDF3F"))),
            React.createElement("div", { className: loading_module_css_1["default"].loadingText }, "Caricamento...")),
        React.createElement("div", { className: loading_module_css_1["default"].progressBar },
            React.createElement("div", { className: loading_module_css_1["default"].progressFill, style: { width: progress + "%" } })),
        React.createElement("div", { className: loading_module_css_1["default"].progressText },
            progress,
            "%")));
}
exports["default"] = LoadingScreen;
