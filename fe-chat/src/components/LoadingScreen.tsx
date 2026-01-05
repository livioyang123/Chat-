// MODIFICA COMPLETA: fe-chat/src/components/LoadingScreen.tsx
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
  const gridRef = useRef<HTMLDivElement>(null);
  const sparkContainerRef = useRef<HTMLDivElement>(null);

  // ✨ Animazione Grid Scan
  useEffect(() => {
    if (!gridRef.current) return;

    const grid = gridRef.current;
    const cells = grid.querySelectorAll(`.${styles.gridCell}`);

    // Animazione scan continua
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

    // Scan line orizzontale
    const scanLine = grid.querySelector(`.${styles.scanLine}`);
    if (scanLine) {
      gsap.to(scanLine, {
        y: '100vh',
        duration: 2,
        repeat: -1,
        ease: 'none'
      });
    }
  }, []);

  // ✨ Click Spark Effect
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!sparkContainerRef.current) return;

      const spark = document.createElement('div');
      spark.className = styles.clickSpark;
      spark.style.left = `${e.clientX}px`;
      spark.style.top = `${e.clientY}px`;
      
      sparkContainerRef.current.appendChild(spark);

      // Animazione con GSAP
      gsap.to(spark, {
        scale: 2,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          spark.remove();
        }
      });

      // Spark particles
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
          onComplete: () => {
            particle.remove();
          }
        });
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Preload data (mantieni logica originale)
  useEffect(() => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    const preloadData = async () => {
      try {
        setProgress(10);
        await MessageService.initializeWebSocket();
        setProgress(40);

        try {
          await ChatService.getUserChats();
        } catch (chatError) {
          console.warn('No chats found (new user):', chatError);
        }
        setProgress(90);

        setProgress(100);
        setTimeout(() => onComplete(), 100);

      } catch (error) {
        console.error('Critical error during preload:', error);
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
      {/* Grid Scan Background */}
      <div ref={gridRef} className={styles.gridBackground}>
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className={styles.gridCell} />
        ))}
        <div className={styles.scanLine} />
      </div>

      {/* Click Spark Container */}
      <div ref={sparkContainerRef} className={styles.sparkContainer} />

      {/* Content */}
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