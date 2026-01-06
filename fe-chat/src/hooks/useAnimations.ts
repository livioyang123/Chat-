// fe-chat/src/hooks/useAnimations.ts - NUOVO FILE
import { useEffect } from 'react';
import { gsap } from 'gsap';

export function useGlobalAnimations() {
  useEffect(() => {
    // ✨ Click Spark Effect Globale
    const handleClick = (e: MouseEvent) => {
      // Crea spark container se non esiste
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

      // Crea spark principale
      const spark = document.createElement('div');
      spark.className = 'clickSpark';
      spark.style.left = `${e.clientX}px`;
      spark.style.top = `${e.clientY}px`;
      sparkContainer.appendChild(spark);

      gsap.to(spark, {
        scale: 3,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => spark.remove()
      });

      // Crea particelle
      const particleCount = 8;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'sparkParticle';
        particle.style.left = `${e.clientX}px`;
        particle.style.top = `${e.clientY}px`;
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
    return () => document.removeEventListener('click', handleClick);
  }, []);
}

// ✨ Hook per animare testo falling
export function useFallingText(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!ref.current) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            const textElements = node.querySelectorAll('.message-text');
            
            textElements.forEach((element) => {
              if (element.textContent) {
                const text = element.textContent;
                const chars = text.split('');
                
                element.innerHTML = chars
                  .map(char => 
                    `<span class="fallText" style="opacity: 0;">${char === ' ' ? '&nbsp;' : char}</span>`
                  )
                  .join('');

                const charElements = element.querySelectorAll('.fallText');
                
                gsap.to(charElements, {
                  opacity: 1,
                  y: 0,
                  rotationX: 0,
                  duration: 0.6,
                  stagger: 0.02,
                  ease: 'back.out(1.7)'
                });
              }
            });
          }
        });
      });
    });

    observer.observe(ref.current, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [ref]);
}