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
  const [status, setStatus] = useState('Inizializzazione...');
  const isLoadingRef = useRef(false); // ✨ Previene doppio caricamento

  useEffect(() => {
    if (isLoadingRef.current) return; // ✨ Evita esecuzioni multiple
    isLoadingRef.current = true;
    const preloadData = async () => {
      try {
        // Step 1: Connessione WebSocket (0-30%)
        setStatus('Connessione al server...');
        await new Promise(resolve => MessageService.initializeWebSocket().then(resolve));
        setProgress(30);

        // Step 2: Caricamento chat (30-70%)
        setStatus('Caricamento chat...');
        await new Promise(resolve => ChatService.getUserChats().then(resolve));
        setProgress(70);

        // Step 3: Finalizzazione (70-100%)
        setStatus('Quasi pronto...');
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(100);

        // Completa il caricamento
        setTimeout(() => onComplete(), 300);

      } catch (error) {
        console.error('Errore durante il precaricamento:', error);
        // Anche in caso di errore, completa il caricamento
        setProgress(100);
        setTimeout(() => onComplete(), 500);
        onComplete();
      }
    };

    preloadData();

    return () => { isLoadingRef.current = false; };

  }, []);

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.animationArea}>
        <div className={styles.sheepWalkContainer}>
          <div className={styles.walkingSheep}>🐑</div>
          <div className={styles.ground}></div>
        </div>
        <div className={styles.loadingText}>{status}</div>
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
