// fe-chat/src/components/LoadingScreen.tsx - VERSIONE CORRETTA
'use client';
import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import styles from '@/styles/loading.module.css';
import { ChatService } from '@/services';
import { MessageService } from '@/services/messageService';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false); // ✨ Previene reload
  const gridRef = useRef<HTMLDivElement>(null);
  const sparkContainerRef = useRef<HTMLDivElement>(null);

  // Grid Scan Animation
  useEffect(() => {
    if (!gridRef.current) return;

    const grid = gridRef.current;
    const cells = grid.querySelectorAll(`.${styles.gridCell}`);

    gsap.to(cells, {
      opacity: 0.8,
      scale: 1.05,
      stagger: {
        amount: 2,
        from: 'random',
        repeat: -1,
        yoyo: true
      },
      duration: 0.5,
      ease: 'power2.inOut'
    });

    const scanLine = grid.querySelector(`.${styles.scanLine}`);
    if (scanLine) {
      gsap.to(scanLine, {
        y: '100vh',
        duration: 1.5,
        repeat: -1,
        ease: 'none'
      });
    }
  }, []);

  // Click Spark Effect
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!sparkContainerRef.current) return;

      const spark = document.createElement('div');
      spark.className = styles.clickSpark;
      spark.style.left = `${e.clientX}px`;
      spark.style.top = `${e.clientY}px`;
      
      sparkContainerRef.current.appendChild(spark);

      gsap.to(spark, {
        scale: 2,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => spark.remove()
      });

      for (let i = 0; i < 6; i++) {
        const particle = document.createElement('div');
        particle.className = styles.sparkParticle;
        particle.style.left = `${e.clientX}px`;
        particle.style.top = `${e.clientY}px`;
        
        sparkContainerRef.current.appendChild(particle);

        const angle = (Math.PI * 2 * i) / 6;
        const distance = 50 + Math.random() * 30;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        gsap.to(particle, {
          x,
          y,
          opacity: 0,
          scale: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => particle.remove()
        });
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // ✨ FIX: Preload con controllo duplicazioni
  useEffect(() => {
    // Previeni multiple esecuzioni
    if (isLoadingRef.current || hasLoadedRef.current) return;
    
    isLoadingRef.current = true;
    hasLoadedRef.current = true;

    const preloadData = async () => {
      try {
        console.log('🚀 Starting preload...');
        setProgress(10);

        // Step 1: WebSocket
        try {
          await MessageService.initializeWebSocket();
          console.log('✅ WebSocket initialized');
          setProgress(40);
        } catch (error) {
          console.warn('⚠️ WebSocket init failed:', error);
          setProgress(40);
        }

        // Step 2: Chats (singola chiamata)
        try {
          const chats = await ChatService.getUserChats();
          console.log('✅ Chats loaded:', chats.length);
          setProgress(90);
        } catch (error) {
          console.warn('⚠️ No chats found (new user or error):', error);
          setProgress(90);
        }

        // Completa
        setProgress(100);
        console.log('✅ Preload complete');
        
        setTimeout(() => {
          onComplete();
        }, 500);

      } catch (error) {
        console.error('❌ Critical error during preload:', error);
        setProgress(100);
        setTimeout(() => onComplete(), 500);
      } finally {
        isLoadingRef.current = false;
      }
    };

    preloadData();

    // Cleanup: reset refs solo al unmount completo
    return () => {
      // Non resettare hasLoadedRef qui per evitare ricaricamenti
    };
  }, [onComplete]);

  return (
    <div className={styles.loadingContainer}>
      <div ref={gridRef} className={styles.gridBackground}>
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className={styles.gridCell} />
        ))}
        <div className={styles.scanLine} />
      </div>

      <div ref={sparkContainerRef} className={styles.sparkContainer} />

      <div className={styles.content}>
        <h1 className={styles.title}>Loading</h1>
        
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className={styles.progressText}>{progress}%</div>
      </div>
    </div>
  );
}