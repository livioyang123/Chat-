'use client';
import { useEffect, useState, useRef } from 'react';
import styles from '@/styles/loading.module.css';
import { ChatService } from '@/services';
import { MessageService } from '@/services/messageService';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    const preloadData = async () => {
      try {
        // Step 1: WebSocket (immediato)
        setProgress(10);
        await MessageService.initializeWebSocket();
        setProgress(40);

        // Step 2: Chat (può essere vuoto per nuovi utenti)
        try {
          await ChatService.getUserChats();
        } catch (chatError) {
          console.warn('No chats found (new user):', chatError);
          // Non è un errore critico
        }
        setProgress(90);

        // Step 3: Finalizza
        setProgress(100);
        
        // Completa SUBITO quando arriva a 100%
        setTimeout(() => onComplete(), 100);

      } catch (error) {
        console.error('Critical error during preload:', error);
        // Anche in caso di errore critico, completa
        setProgress(100);
        setTimeout(() => onComplete(), 200);
      }
    };

    preloadData();

    return () => { 
      isLoadingRef.current = false; 
    };

  }, [onComplete]);

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.animationArea}>
        <div className={styles.sheepWalkContainer}>
          <div className={styles.walkingSheep}>🐑</div>
          <div className={styles.ground}></div>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className={styles.progressText}>{progress}%</div>
    </div>
  );
}