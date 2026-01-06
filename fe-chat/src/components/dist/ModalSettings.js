"use strict";
exports.__esModule = true;
// fe-chat/src/components/ModalSettings.tsx - NUOVO
var react_1 = require("react");
var io5_1 = require("react-icons/io5");
var useTheme_1 = require("@/hooks/useTheme");
var modalSettings_module_css_1 = require("@/styles/modalSettings.module.css");
function ModalSettings(_a) {
    var onClose = _a.onClose;
    var _b = useTheme_1.useTheme(), theme = _b.theme, customTheme = _b.customTheme, changeTheme = _b.changeTheme, setCustomColors = _b.setCustomColors, resetTheme = _b.resetTheme;
    var _c = react_1.useState((customTheme === null || customTheme === void 0 ? void 0 : customTheme.primaryColor) || '#6366f1'), primaryColor = _c[0], setPrimaryColor = _c[1];
    var _d = react_1.useState((customTheme === null || customTheme === void 0 ? void 0 : customTheme.secondaryColor) || '#8b5cf6'), secondaryColor = _d[0], setSecondaryColor = _d[1];
    var handleApplyCustom = function () {
        setCustomColors({
            primaryColor: primaryColor,
            secondaryColor: secondaryColor
        });
    };
    var presetThemes = [
        { name: 'Ocean', primary: '#0ea5e9', secondary: '#06b6d4' },
        { name: 'Forest', primary: '#10b981', secondary: '#059669' },
        { name: 'Sunset', primary: '#f59e0b', secondary: '#ef4444' },
        { name: 'Purple', primary: '#8b5cf6', secondary: '#a78bfa' },
        { name: 'Pink', primary: '#ec4899', secondary: '#f472b6' }
    ];
    return (React.createElement("div", { className: modalSettings_module_css_1["default"].overlay, onClick: onClose },
        React.createElement("div", { className: modalSettings_module_css_1["default"].modal, onClick: function (e) { return e.stopPropagation(); } },
            React.createElement("div", { className: modalSettings_module_css_1["default"].header },
                React.createElement("h2", { className: modalSettings_module_css_1["default"].title }, "\u2699\uFE0F Impostazioni"),
                React.createElement("button", { className: modalSettings_module_css_1["default"].closeBtn, onClick: onClose, title: 'chiudi finestra' },
                    React.createElement(io5_1.IoClose, null))),
            React.createElement("div", { className: modalSettings_module_css_1["default"].content },
                React.createElement("section", { className: modalSettings_module_css_1["default"].section },
                    React.createElement("h3", { className: modalSettings_module_css_1["default"].sectionTitle }, "Tema"),
                    React.createElement("div", { className: modalSettings_module_css_1["default"].themeGrid },
                        React.createElement("button", { className: modalSettings_module_css_1["default"].themeCard + " " + (theme === 'light' ? modalSettings_module_css_1["default"].active : ''), onClick: function () { return changeTheme('light'); } },
                            React.createElement(io5_1.IoSunny, { className: modalSettings_module_css_1["default"].themeIcon }),
                            React.createElement("span", null, "Chiaro")),
                        React.createElement("button", { className: modalSettings_module_css_1["default"].themeCard + " " + (theme === 'dark' ? modalSettings_module_css_1["default"].active : ''), onClick: function () { return changeTheme('dark'); } },
                            React.createElement(io5_1.IoMoon, { className: modalSettings_module_css_1["default"].themeIcon }),
                            React.createElement("span", null, "Scuro")),
                        React.createElement("button", { className: modalSettings_module_css_1["default"].themeCard + " " + (theme === 'custom' ? modalSettings_module_css_1["default"].active : ''), onClick: function () { return changeTheme('custom'); } },
                            React.createElement(io5_1.IoColorPalette, { className: modalSettings_module_css_1["default"].themeIcon }),
                            React.createElement("span", null, "Personalizzato")))),
                React.createElement("section", { className: modalSettings_module_css_1["default"].section },
                    React.createElement("h3", { className: modalSettings_module_css_1["default"].sectionTitle }, "Preset Colori"),
                    React.createElement("div", { className: modalSettings_module_css_1["default"].presetGrid }, presetThemes.map(function (preset) { return (React.createElement("button", { key: preset.name, className: modalSettings_module_css_1["default"].presetCard, onClick: function () {
                            setPrimaryColor(preset.primary);
                            setSecondaryColor(preset.secondary);
                            setCustomColors({
                                primaryColor: preset.primary,
                                secondaryColor: preset.secondary
                            });
                        }, style: {
                            background: "linear-gradient(135deg, " + preset.primary + " 0%, " + preset.secondary + " 100%)"
                        } }, preset.name)); }))),
                React.createElement("section", { className: modalSettings_module_css_1["default"].section },
                    React.createElement("h3", { className: modalSettings_module_css_1["default"].sectionTitle }, "Colori Personalizzati"),
                    React.createElement("div", { className: modalSettings_module_css_1["default"].colorPickers },
                        React.createElement("div", { className: modalSettings_module_css_1["default"].colorInput },
                            React.createElement("label", { htmlFor: "primary" }, "Colore Primario"),
                            React.createElement("div", { className: modalSettings_module_css_1["default"].colorInputRow },
                                React.createElement("input", { id: "primary", type: "color", value: primaryColor, onChange: function (e) { return setPrimaryColor(e.target.value); } }),
                                React.createElement("span", { className: modalSettings_module_css_1["default"].colorValue }, primaryColor))),
                        React.createElement("div", { className: modalSettings_module_css_1["default"].colorInput },
                            React.createElement("label", { htmlFor: "secondary" }, "Colore Secondario"),
                            React.createElement("div", { className: modalSettings_module_css_1["default"].colorInputRow },
                                React.createElement("input", { id: "secondary", type: "color", value: secondaryColor, onChange: function (e) { return setSecondaryColor(e.target.value); } }),
                                React.createElement("span", { className: modalSettings_module_css_1["default"].colorValue }, secondaryColor)))),
                    React.createElement("div", { className: modalSettings_module_css_1["default"].preview },
                        React.createElement("div", { className: modalSettings_module_css_1["default"].previewGradient, style: {
                                background: "linear-gradient(135deg, " + primaryColor + " 0%, " + secondaryColor + " 100%)"
                            } }),
                        React.createElement("span", null, "Anteprima Gradiente")),
                    React.createElement("button", { className: modalSettings_module_css_1["default"].applyBtn, onClick: handleApplyCustom }, "Applica Colori Personalizzati")),
                React.createElement("section", { className: modalSettings_module_css_1["default"].section },
                    React.createElement("button", { className: modalSettings_module_css_1["default"].resetBtn, onClick: resetTheme }, "\uD83D\uDD04 Ripristina Tema Predefinito"))))));
}
exports["default"] = ModalSettings;
