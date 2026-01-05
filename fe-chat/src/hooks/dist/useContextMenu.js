"use strict";
exports.__esModule = true;
exports.useContextMenu = void 0;
// NUOVO FILE: fe-chat/src/hooks/useContextMenu.ts
var react_1 = require("react");
function useContextMenu() {
    var _a = react_1.useState(false), isOpen = _a[0], setIsOpen = _a[1];
    var _b = react_1.useState({ x: 0, y: 0 }), position = _b[0], setPosition = _b[1];
    var _c = react_1.useState([]), options = _c[0], setOptions = _c[1];
    var menuRef = react_1.useRef(null);
    // ✨ Calcola posizione ottimale del menu
    var calculatePosition = react_1.useCallback(function (e) {
        var menuWidth = 200; // Larghezza menu approssimativa
        var menuHeight = 40 * options.length; // Altezza basata su numero opzioni
        var viewportWidth = window.innerWidth;
        var viewportHeight = window.innerHeight;
        var x = e.clientX;
        var y = e.clientY;
        // Se menu esce a destra, spostalo a sinistra
        if (x + menuWidth > viewportWidth) {
            x = e.clientX - menuWidth;
        }
        // Se menu esce in basso, spostalo sopra
        if (y + menuHeight > viewportHeight) {
            y = e.clientY - menuHeight;
        }
        // Assicura che non esca mai dal viewport
        x = Math.max(10, Math.min(x, viewportWidth - menuWidth - 10));
        y = Math.max(10, Math.min(y, viewportHeight - menuHeight - 10));
        return { x: x, y: y };
    }, [options.length]);
    var openMenu = react_1.useCallback(function (e, menuOptions) {
        e.preventDefault();
        e.stopPropagation();
        setOptions(menuOptions);
        // Calcola posizione dopo aver impostato le opzioni
        setTimeout(function () {
            var pos = calculatePosition(e);
            setPosition(pos);
            setIsOpen(true);
        }, 0);
    }, [calculatePosition]);
    var closeMenu = react_1.useCallback(function () {
        setIsOpen(false);
    }, []);
    // Chiudi menu al click fuori
    react_1.useEffect(function () {
        var handleClickOutside = function (event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                closeMenu();
            }
        };
        var handleScroll = function () {
            closeMenu();
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('scroll', handleScroll, true);
            // Disabilita il context menu di default del browser
            document.addEventListener('contextmenu', function (e) { return e.preventDefault(); });
            return function () {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('scroll', handleScroll, true);
                document.removeEventListener('contextmenu', function (e) { return e.preventDefault(); });
            };
        }
    }, [isOpen, closeMenu]);
    // Chiudi con ESC
    react_1.useEffect(function () {
        var handleEscape = function (e) {
            if (e.key === 'Escape') {
                closeMenu();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return function () { return document.removeEventListener('keydown', handleEscape); };
        }
    }, [isOpen, closeMenu]);
    return {
        isOpen: isOpen,
        position: position,
        options: options,
        openMenu: openMenu,
        closeMenu: closeMenu
    };
}
exports.useContextMenu = useContextMenu;
