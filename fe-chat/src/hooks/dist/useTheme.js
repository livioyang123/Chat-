"use strict";
exports.__esModule = true;
exports.useTheme = void 0;
// fe-chat/src/hooks/useTheme.ts - NUOVO
var react_1 = require("react");
function useTheme() {
    var _a = react_1.useState('light'), theme = _a[0], setTheme = _a[1];
    var _b = react_1.useState(null), customTheme = _b[0], setCustomTheme = _b[1];
    // Carica tema salvato
    react_1.useEffect(function () {
        var savedTheme = localStorage.getItem('theme');
        var savedCustom = localStorage.getItem('customTheme');
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
        if (savedCustom) {
            try {
                var parsed = JSON.parse(savedCustom);
                setCustomTheme(parsed);
                applyCustomTheme(parsed);
            }
            catch (error) {
                console.error('Error loading custom theme:', error);
            }
        }
    }, []);
    var applyCustomTheme = function (custom) {
        var root = document.documentElement;
        root.style.setProperty('--custom-primary', custom.primaryColor);
        root.style.setProperty('--custom-secondary', custom.secondaryColor);
        if (custom.gradient) {
            root.style.setProperty('--custom-gradient', custom.gradient);
        }
        else {
            var gradient = "linear-gradient(135deg, " + custom.primaryColor + " 0%, " + custom.secondaryColor + " 100%)";
            root.style.setProperty('--custom-gradient', gradient);
        }
    };
    var changeTheme = function (newTheme) {
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };
    var setCustomColors = function (colors) {
        setCustomTheme(colors);
        applyCustomTheme(colors);
        localStorage.setItem('customTheme', JSON.stringify(colors));
        changeTheme('custom');
    };
    var resetTheme = function () {
        changeTheme('light');
        setCustomTheme(null);
        localStorage.removeItem('customTheme');
        var root = document.documentElement;
        root.style.removeProperty('--custom-primary');
        root.style.removeProperty('--custom-secondary');
        root.style.removeProperty('--custom-gradient');
    };
    return {
        theme: theme,
        customTheme: customTheme,
        changeTheme: changeTheme,
        setCustomColors: setCustomColors,
        resetTheme: resetTheme
    };
}
exports.useTheme = useTheme;
