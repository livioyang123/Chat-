import { useState } from 'react';

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export function useErrorBoundary() {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorInfo: null
  });

  const resetError = () => {
    setErrorState({ hasError: false, error: null, errorInfo: null });
  };

  const captureError = (error: Error, errorInfo?: string) => {
    console.error('🚨 Error captured:', error);
    console.error('📍 Error info:', errorInfo);
    
    setErrorState({
      hasError: true,
      error,
      errorInfo: errorInfo || error.message
    });

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  };

  return { errorState, captureError, resetError };
}