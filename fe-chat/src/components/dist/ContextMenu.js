"use strict";
exports.__esModule = true;
// fe-chat/src/components/ContextMenu.tsx
var react_1 = require("react");
var contextMenu_module_css_1 = require("@/styles/contextMenu.module.css");
var ContextMenu = react_1.forwardRef(function (_a, ref) {
    var isOpen = _a.isOpen, position = _a.position, options = _a.options, onClose = _a.onClose;
    var internalRef = react_1.useRef(null);
    var menuRef = ref || internalRef;
    react_1.useEffect(function () {
        if (isOpen && menuRef.current) {
            menuRef.current.focus();
        }
    }, [isOpen, menuRef]);
    if (!isOpen)
        return null;
    return (React.createElement("div", { ref: menuRef, className: contextMenu_module_css_1["default"].contextMenu, style: {
            left: position.x + "px",
            top: position.y + "px"
        }, role: "menu", tabIndex: -1, onClick: function (e) { return e.stopPropagation(); } }, options.map(function (option, index) { return (React.createElement("button", { key: index, className: contextMenu_module_css_1["default"].menuItem + " " + (option.danger ? contextMenu_module_css_1["default"].danger : '') + " " + (option.disabled ? contextMenu_module_css_1["default"].disabled : ''), onClick: function () {
            if (!option.disabled) {
                option.onClick();
                onClose();
            }
        }, disabled: option.disabled, role: "menuitem" },
        option.icon && React.createElement("span", { className: contextMenu_module_css_1["default"].icon }, option.icon),
        React.createElement("span", { className: contextMenu_module_css_1["default"].label }, option.label))); })));
});
ContextMenu.displayName = 'ContextMenu';
exports["default"] = ContextMenu;
