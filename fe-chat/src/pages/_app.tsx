// src/pages/_app.tsx
import '@/styles/global.css';
import type { AppProps } from 'next/app';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}