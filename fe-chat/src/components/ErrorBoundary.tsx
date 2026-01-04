import React, { Component, ErrorInfo, ReactNode } from 'react';
import styles from '@/styles/errorBoundary.module.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary caught:', error);
    console.error('📍 Component stack:', errorInfo.componentStack);

    this.setState({
      error,
      errorInfo
    });

    // Log to external monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <h1 className={styles.errorTitle}>⚠️ Qualcosa è andato storto</h1>
            <p className={styles.errorMessage}>
              Si è verificato un errore imprevisto. Lapplicazione continuerà a funzionare.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className={styles.errorDetails}>
                <summary>Dettagli tecnici (solo dev)</summary>
                <pre className={styles.errorStack}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className={styles.errorActions}>
              <button 
                onClick={this.handleReset}
                className={styles.retryButton}
              >
                🔄 Riprova
              </button>
              <button 
                onClick={() => window.location.reload()}
                className={styles.reloadButton}
              >
                🔃 Ricarica Pagina
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}