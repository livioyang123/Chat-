import { useRef, useEffect } from 'react';
import type { ContextMenuOption } from '@/hooks/useContextMenu';
import styles from '@/styles/contextMenu.module.css';

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  options: ContextMenuOption[];
  onClose: () => void;
}

export default function ContextMenu({ isOpen, position, options, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      // Focus sul menu per accessibilità
      menuRef.current.focus();
    }
  }, [isOpen]);

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