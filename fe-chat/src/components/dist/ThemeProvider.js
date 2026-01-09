"use strict";
exports.__esModule = true;
exports.useTheme = exports.ThemeProvider = void 0;
// fe-chat/src/context/ThemeProvider.tsx - NUOVO FILE
var react_1 = require("react");
var ThemeContext = react_1.createContext(undefined);
function ThemeProvider(_a) {
    var children = _a.children;
    var _b = react_1.useState('light'), theme = _b[0], setTheme = _b[1];
    var _c = react_1.useState(null), customTheme = _c[0], setCustomTheme = _c[1];
    // Carica tema salvato all'avvio
    react_1.useEffect(function () {
        var savedTheme = localStorage.getItem('theme');
        var savedCustom = localStorage.getItem('customTheme');
        if (savedTheme) {
            setTheme(savedTheme);
            applyThemeToDOM(savedTheme);
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
    var applyThemeToDOM = function (newTheme) {
        document.documentElement.setAttribute('data-theme', newTheme);
    };
    var applyCustomTheme = function (custom) {
        var root = document.documentElement;
        root.style.setProperty('--custom-primary', custom.primaryColor);
        root.style.setProperty('--custom-secondary', custom.secondaryColor);
        var gradient = custom.gradient ||
            "linear-gradient(135deg, " + custom.primaryColor + " 0%, " + custom.secondaryColor + " 100%)";
        root.style.setProperty('--custom-gradient', gradient);
    };
    var changeTheme = function (newTheme) {
        setTheme(newTheme);
        applyThemeToDOM(newTheme);
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
    return (React.createElement(ThemeContext.Provider, { value: {
            theme: theme,
            customTheme: customTheme,
            changeTheme: changeTheme,
            setCustomColors: setCustomColors,
            resetTheme: resetTheme
        } }, children));
}
exports.ThemeProvider = ThemeProvider;
function useTheme() {
    var context = react_1.useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
exports.useTheme = useTheme;
