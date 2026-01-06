// fe-chat/src/components/GlobalAnimationsProvider.tsx - NUOVO
'use client';
import { useEffect } from 'react';
import { gsap } from 'gsap';

export default function GlobalAnimationsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // ✨ Click Spark Effect Globale
    const handleClick = (e: MouseEvent) => {
      let sparkContainer = document.getElementById('global-spark-container');
      
      if (!sparkContainer) {
        sparkContainer = document.createElement('div');
        sparkContainer.id = 'global-spark-container';
        sparkContainer.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 99999;
        `;
        document.body.appendChild(sparkContainer);
      }

      // Spark principale
      const spark = document.createElement('div');
      spark.style.cssText = `
        position: absolute;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(99, 102, 241, 0.8) 0%, transparent 70%);
        box-shadow: 0 0 40px rgba(99, 102, 241, 0.6);
        pointer-events: none;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        transform: translate(-50%, -50%);
      `;
      sparkContainer.appendChild(spark);

      gsap.to(spark, {
        scale: 3,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => spark.remove()
      });

      // Particelle
      const particleCount = 8;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6366f1;
          box-shadow: 0 0 20px #6366f1;
          pointer-events: none;
          left: ${e.clientX}px;
          top: ${e.clientY}px;
          transform: translate(-50%, -50%);
        `;
        sparkContainer.appendChild(particle);

        const angle = (Math.PI * 2 * i) / particleCount;
        const distance = 60 + Math.random() * 40;
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
    
    return () => {
      document.removeEventListener('click', handleClick);
      const container = document.getElementById('global-spark-container');
      if (container) container.remove();
    };
  }, []);

  return <>{children}</>;
}