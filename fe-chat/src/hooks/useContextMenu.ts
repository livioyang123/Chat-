// fe-chat/src/hooks/useContextMenu.ts - VERSIONE CORRETTA
import { useState, useEffect, useCallback } from 'react';

export interface ContextMenuOption {
  label: string;
  icon?: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface UseContextMenuReturn {
  isOpen: boolean;
  position: { x: number; y: number };
  options: ContextMenuOption[];
  openMenu: (e: React.MouseEvent, options: ContextMenuOption[]) => void;
  closeMenu: () => void;
}

export function useContextMenu(): UseContextMenuReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [options, setOptions] = useState<ContextMenuOption[]>([]);

  const openMenu = useCallback((e: React.MouseEvent, menuOptions: ContextMenuOption[]) => {
    e.preventDefault();
    e.stopPropagation();
    
    const MENU_WIDTH = 200;
    const MENU_HEIGHT = menuOptions.length * 44 + 12;
    const CURSOR_OFFSET = 2; // Offset minimo dal cursore
    
    // ✨ FIX: Posizione esatta del mouse
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    let x = mouseX;
    let y = mouseY;
    
    // ✨ CORREZIONE: Controlla spazio disponibile a destra
    const spaceRight = window.innerWidth - mouseX;
    const spaceBottom = window.innerHeight - mouseY;
    
    // Se non c'è spazio a destra, mostra a SINISTRA del cursore
    if (spaceRight < MENU_WIDTH + 10) {
      x = mouseX - MENU_WIDTH - CURSOR_OFFSET;
    } else {
      x = mouseX + CURSOR_OFFSET;
    }
    
    // Se non c'è spazio sotto, mostra SOPRA il cursore
    if (spaceBottom < MENU_HEIGHT + 10) {
      y = mouseY - MENU_HEIGHT - CURSOR_OFFSET;
    } else {
      y = mouseY + CURSOR_OFFSET;
    }
    
    // Assicura che non esca mai dallo schermo
    x = Math.max(10, Math.min(x, window.innerWidth - MENU_WIDTH - 10));
    y = Math.max(10, Math.min(y, window.innerHeight - MENU_HEIGHT - 10));
    
    setPosition({ x, y });
    setOptions(menuOptions);
    setIsOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Chiudi al click fuori
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[role="menu"]')) {
        closeMenu();
      }
    };

    const handleScroll = () => closeMenu();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };

    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true);
      document.addEventListener('keydown', handleEscape);
    }, 100);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeMenu]);

  return { isOpen, position, options, openMenu, closeMenu };
}

// ✨ Factory per opzioni comuni
export const ContextMenuActions = {
  manageMembers: (onManage: () => void): ContextMenuOption => ({
    label: 'Gestisci membri',
    icon: '👥',
    onClick: onManage
  }),

  leaveGroup: (chatName: string, onLeave: () => void): ContextMenuOption => ({
    label: 'Abbandona gruppo',
    icon: '🚪',
    danger: true,
    onClick: onLeave
  }),

  deleteChat: (chatName: string, onDelete: () => void): ContextMenuOption => ({
    label: 'Elimina chat',
    icon: '🗑️',
    danger: true,
    onClick: onDelete
  }),

  deleteMessage: (onDelete: () => void): ContextMenuOption => ({
    label: 'Elimina messaggio',
    icon: '🗑️',
    danger: true,
    onClick: onDelete
  })
};