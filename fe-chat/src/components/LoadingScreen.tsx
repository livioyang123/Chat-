// src/components/LoadingScreen.tsx
'use client';
import { useEffect, useState } from 'react';
import styles from '@/styles/loading.module.css';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.animationArea}>
        {/* Pecore che mangiano */}
        <div className={styles.sheepContainer}>
          <div className={styles.sheep}>
            <div className={styles.sheepBody}>🐑</div>
            <div className={styles.grass}>🌿</div>
          </div>
          <div className={`${styles.sheep} ${styles.sheep2}`}>
            <div className={styles.sheepBody}>🐑</div>
            <div className={styles.grass}>🌿</div>
          </div>
          <div className={`${styles.sheep} ${styles.sheep3}`}>
            <div className={styles.sheepBody}>🐑</div>
            <div className={styles.grass}>🌿</div>
          </div>
        </div>

        <div className={styles.loadingText}>Caricamento...</div>
      </div>

      {/* Barra di progresso */}
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