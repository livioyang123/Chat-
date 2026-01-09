// fe-chat/src/components/ModalSettings.tsx - NUOVO
import { useState } from 'react';
import { IoClose, IoSunny, IoMoon, IoColorPalette } from 'react-icons/io5';
import { useTheme } from '@/components/ThemeProvider';
import styles from '@/styles/modalSettings.module.css';

interface ModalSettingsProps {
  onClose: () => void;
}

export default function ModalSettings({ onClose }: ModalSettingsProps) {
  const { theme, customTheme, changeTheme, setCustomColors, resetTheme } = useTheme();
  const [primaryColor, setPrimaryColor] = useState(customTheme?.primaryColor || '#6366f1');
  const [secondaryColor, setSecondaryColor] = useState(customTheme?.secondaryColor || '#8b5cf6');

  const handleApplyCustom = () => {
    setCustomColors({
      primaryColor,
      secondaryColor
    });
  };

  const presetThemes = [
    { name: 'Ocean', primary: '#0ea5e9', secondary: '#06b6d4' },
    { name: 'Forest', primary: '#10b981', secondary: '#059669' },
    { name: 'Sunset', primary: '#f59e0b', secondary: '#ef4444' },
    { name: 'Purple', primary: '#8b5cf6', secondary: '#a78bfa' },
    { name: 'Pink', primary: '#ec4899', secondary: '#f472b6' }
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>⚙️ Impostazioni</h2>
          <button className={styles.closeBtn} onClick={onClose} title='chiudi finestra'>
            <IoClose />
          </button>
        </div>

        <div className={styles.content}>
          {/* Tema Predefinito */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Tema</h3>
            <div className={styles.themeGrid}>
              <button
                className={`${styles.themeCard} ${theme === 'light' ? styles.active : ''}`}
                onClick={() => changeTheme('light')}
              >
                <IoSunny className={styles.themeIcon} />
                <span>Chiaro</span>
              </button>

              <button
                className={`${styles.themeCard} ${theme === 'dark' ? styles.active : ''}`}
                onClick={() => changeTheme('dark')}
              >
                <IoMoon className={styles.themeIcon} />
                <span>Scuro</span>
              </button>

              <button
                className={`${styles.themeCard} ${theme === 'custom' ? styles.active : ''}`}
                onClick={() => changeTheme('custom')}
              >
                <IoColorPalette className={styles.themeIcon} />
                <span>Personalizzato</span>
              </button>
            </div>
          </section>

          {/* Preset Temi */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Preset Colori</h3>
            <div className={styles.presetGrid}>
              {presetThemes.map((preset) => (
                <button
                  key={preset.name}
                  className={styles.presetCard}
                  onClick={() => {
                    setPrimaryColor(preset.primary);
                    setSecondaryColor(preset.secondary);
                    setCustomColors({
                      primaryColor: preset.primary,
                      secondaryColor: preset.secondary
                    });
                  }}
                  style={{
                    background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.secondary} 100%)`
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </section>

          {/* Custom Colors */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Colori Personalizzati</h3>
            <div className={styles.colorPickers}>
              <div className={styles.colorInput}>
                <label htmlFor="primary">Colore Primario</label>
                <div className={styles.colorInputRow}>
                  <input
                    id="primary"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                  <span className={styles.colorValue}>{primaryColor}</span>
                </div>
              </div>

              <div className={styles.colorInput}>
                <label htmlFor="secondary">Colore Secondario</label>
                <div className={styles.colorInputRow}>
                  <input
                    id="secondary"
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                  />
                  <span className={styles.colorValue}>{secondaryColor}</span>
                </div>
              </div>
            </div>

            <div className={styles.preview}>
              <div 
                className={styles.previewGradient}
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
                }}
              />
              <span>Anteprima Gradiente</span>
            </div>

            <button className={styles.applyBtn} onClick={handleApplyCustom}>
              Applica Colori Personalizzati
            </button>
          </section>

          {/* Reset */}
          <section className={styles.section}>
            <button className={styles.resetBtn} onClick={resetTheme}>
              🔄 Ripristina Tema Predefinito
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}