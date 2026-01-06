// fe-chat/src/components/ContextMenu.tsx
import { useRef, useEffect, forwardRef } from 'react';
import type { ContextMenuOption } from '@/hooks/useContextMenu';
import styles from '@/styles/contextMenu.module.css';

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  options: ContextMenuOption[];
  onClose: () => void;
}

const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(
  ({ isOpen, position, options, onClose }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const menuRef = (ref as React.RefObject<HTMLDivElement>) || internalRef;

    useEffect(() => {
      if (isOpen && menuRef.current) {
        menuRef.current.focus();
      }
    }, [isOpen, menuRef]);

    if (!isOpen) return null;

    return (
      <div
        ref={menuRef}
        className={styles.contextMenu}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        role="menu"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {options.map((option, index) => (
          <button
            key={index}
            className={`${styles.menuItem} ${option.danger ? styles.danger : ''} ${option.disabled ? styles.disabled : ''}`}
            onClick={() => {
              if (!option.disabled) {
                option.onClick();
                onClose();
              }
            }}
            disabled={option.disabled}
            role="menuitem"
          >
            {option.icon && <span className={styles.icon}>{option.icon}</span>}
            <span className={styles.label}>{option.label}</span>
          </button>
        ))}
      </div>
    );
  }
);

ContextMenu.displayName = 'ContextMenu';

export default ContextMenu;