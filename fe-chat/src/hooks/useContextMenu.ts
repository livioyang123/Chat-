// NUOVO FILE: fe-chat/src/hooks/useContextMenu.ts
import { useState, useEffect, useCallback, useRef } from 'react';

export interface ContextMenuOption {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean; // Per evidenziare azioni pericolose (elimina, abbandona)
  disabled?: boolean;
}

interface ContextMenuPosition {
  x: number;
  y: number;
}

interface UseContextMenuReturn {
  isOpen: boolean;
  position: ContextMenuPosition;
  options: ContextMenuOption[];
  openMenu: (e: React.MouseEvent, options: ContextMenuOption[]) => void;
  closeMenu: () => void;
}

export function useContextMenu(): UseContextMenuReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 });
  const [options, setOptions] = useState<ContextMenuOption[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  // ✨ Calcola posizione ottimale del menu
  const calculatePosition = useCallback((e: React.MouseEvent) => {
    const menuWidth = 200; // Larghezza menu approssimativa
    const menuHeight = 40 * options.length; // Altezza basata su numero opzioni
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let x = e.clientX;
    let y = e.clientY;
    
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
    
    return { x, y };
  }, [options.length]);

  const openMenu = useCallback((e: React.MouseEvent, menuOptions: ContextMenuOption[]) => {
    e.preventDefault();
    e.stopPropagation();
    
    setOptions(menuOptions);
    
    // Calcola posizione dopo aver impostato le opzioni
    setTimeout(() => {
      const pos = calculatePosition(e);
      setPosition(pos);
      setIsOpen(true);
    }, 0);
  }, [calculatePosition]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Chiudi menu al click fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const handleScroll = () => {
      closeMenu();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true);
      // Disabilita il context menu di default del browser
      document.addEventListener('contextmenu', (e) => e.preventDefault());
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('scroll', handleScroll, true);
        document.removeEventListener('contextmenu', (e) => e.preventDefault());
      };
    }
  }, [isOpen, closeMenu]);

  // Chiudi con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closeMenu]);

  return {
    isOpen,
    position,
    options,
    openMenu,
    closeMenu
  };
}