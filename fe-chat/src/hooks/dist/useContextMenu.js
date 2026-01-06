"use strict";
exports.__esModule = true;
exports.ContextMenuActions = exports.useContextMenu = void 0;
// fe-chat/src/hooks/useContextMenu.ts - VERSIONE CORRETTA
var react_1 = require("react");
function useContextMenu() {
    var _a = react_1.useState(false), isOpen = _a[0], setIsOpen = _a[1];
    var _b = react_1.useState({ x: 0, y: 0 }), position = _b[0], setPosition = _b[1];
    var _c = react_1.useState([]), options = _c[0], setOptions = _c[1];
    var openMenu = react_1.useCallback(function (e, menuOptions) {
        e.preventDefault();
        e.stopPropagation();
        var MENU_WIDTH = 200;
        var MENU_HEIGHT = menuOptions.length * 44 + 12;
        var CURSOR_OFFSET = 2; // Offset minimo dal cursore
        // ✨ FIX: Posizione esatta del mouse
        var mouseX = e.clientX;
        var mouseY = e.clientY;
        var x = mouseX;
        var y = mouseY;
        // ✨ CORREZIONE: Controlla spazio disponibile a destra
        var spaceRight = window.innerWidth - mouseX;
        var spaceBottom = window.innerHeight - mouseY;
        // Se non c'è spazio a destra, mostra a SINISTRA del cursore
        if (spaceRight < MENU_WIDTH + 10) {
            x = mouseX - MENU_WIDTH - CURSOR_OFFSET;
        }
        else {
            x = mouseX + CURSOR_OFFSET;
        }
        // Se non c'è spazio sotto, mostra SOPRA il cursore
        if (spaceBottom < MENU_HEIGHT + 10) {
            y = mouseY - MENU_HEIGHT - CURSOR_OFFSET;
        }
        else {
            y = mouseY + CURSOR_OFFSET;
        }
        // Assicura che non esca mai dallo schermo
        x = Math.max(10, Math.min(x, window.innerWidth - MENU_WIDTH - 10));
        y = Math.max(10, Math.min(y, window.innerHeight - MENU_HEIGHT - 10));
        setPosition({ x: x, y: y });
        setOptions(menuOptions);
        setIsOpen(true);
    }, []);
    var closeMenu = react_1.useCallback(function () {
        setIsOpen(false);
    }, []);
    // Chiudi al click fuori
    react_1.useEffect(function () {
        if (!isOpen)
            return;
        var handleClickOutside = function (event) {
            var target = event.target;
            if (!target.closest('[role="menu"]')) {
                closeMenu();
            }
        };
        var handleScroll = function () { return closeMenu(); };
        var handleEscape = function (e) {
            if (e.key === 'Escape')
                closeMenu();
        };
        setTimeout(function () {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('scroll', handleScroll, true);
            document.addEventListener('keydown', handleEscape);
        }, 100);
        return function () {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('scroll', handleScroll, true);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, closeMenu]);
    return { isOpen: isOpen, position: position, options: options, openMenu: openMenu, closeMenu: closeMenu };
}
exports.useContextMenu = useContextMenu;
// ✨ Factory per opzioni comuni
exports.ContextMenuActions = {
    manageMembers: function (onManage) { return ({
        label: 'Gestisci membri',
        icon: '👥',
        onClick: onManage
    }); },
    leaveGroup: function (chatName, onLeave) { return ({
        label: 'Abbandona gruppo',
        icon: '🚪',
        danger: true,
        onClick: onLeave
    }); },
    deleteChat: function (chatName, onDelete) { return ({
        label: 'Elimina chat',
        icon: '🗑️',
        danger: true,
        onClick: onDelete
    }); },
    deleteMessage: function (onDelete) { return ({
        label: 'Elimina messaggio',
        icon: '🗑️',
        danger: true,
        onClick: onDelete
    }); }
};
