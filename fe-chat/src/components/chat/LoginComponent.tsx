import { useEffect, useState, useCallback } from 'react';
import { AuthService } from '@/services';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import LoadingScreen from '@/components/LoadingScreen';

const LoginComponent = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/chat');
    const timer = setTimeout(() => {
      router.prefetch('/register');
    }, 100);
    return () => clearTimeout(timer);
  }, [router]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Pulisci errore quando l'utente modifica i campi
    if (error) setError('');
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await AuthService.login({
        username: formData.username,
        password: formData.password
      });

      try {
        await AuthService.getProfile(formData.username);
      } catch (err) {
        console.warn('Profile loading failed:', err);
      }

      // Mostra loading screen SOLO dopo login riuscito
      setShowLoading(true);

    } catch (error) {
      console.log('Login error:', error);
      setLoading(false); // Ferma loading immediatamente
      
      // Gestione errore migliorata - resta nella pagina
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401 || status === 400) {
          setError('Username o password non corretti');
        } else if (status === 500) {
          setError('Errore del server. Riprova più tardi.');
        } else {
          setError(error.response?.data?.message || 'Errore di connessione');
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Errore sconosciuto. Riprova.');
      }
    }
  };

  const handleLoadingComplete = () => {
    setFormData({username:"", password:""});
    setLoading(false);
    router.replace('/chat');
  };

  // Mostra loading screen se sta caricando
  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="login-container">
      <span className="login-title">Chat</span>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          name="username"
          placeholder="Nome"
          value={formData.username}
          onChange={handleChange}
          required
          autoComplete="username"
          disabled={loading}
          className="login-input"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
          disabled={loading}
          className="login-input"
        />
        <button
          type="submit"
          disabled={loading}
          className="login-button"
        >
          {loading ? 'Accesso...' : 'Accedi'}
        </button>
        {error && (
          <div className="error-message" aria-live="polite">
            {error}
          </div>
        )}
      </form>

      <div className="register-link">
        Non hai un account? <Link href="/register" prefetch={true}>Registrati</Link>
      </div>
    </div>
  );
};

export default LoginComponent;