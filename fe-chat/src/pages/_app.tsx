// fe-chat/src/pages/_app.tsx - AGGIORNATO
import '@/styles/global.css';
import '@/styles/animations/animations.css'; // ✨ Importa animazioni globali
import type { AppProps } from 'next/app';
import ErrorBoundary from '@/components/ErrorBoundary';
import GlobalAnimationsProvider from '@/components/GlobalAnimationsProvider';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <GlobalAnimationsProvider>
        <Component {...pageProps} />
      </GlobalAnimationsProvider>
    </ErrorBoundary>
  );
}