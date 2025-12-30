// Modifica LoginComponent.tsx per usare LoadingScreen
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
  const [showLoading, setShowLoading] = useState(false); // Per animazione pecore
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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowLoading(true); // Mostra animazione pecore

    try {
      const loginPromise = AuthService.login({
        username: formData.username,
        password: formData.password
      });

      await loginPromise;

      try {
        await AuthService.getProfile(formData.username);
      } catch (err) {
        console.warn('Profile loading failed:', err);
      }

      // Il LoadingScreen gestirà la transizione
    } catch (error) {
      console.log('Login error:', error);
      setShowLoading(false); // Nascondi se errore
      
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || error.message);
      } else {
        setError('Errore di accesso. Riprova.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoadingComplete = () => {
    setFormData({username:"", password:""});
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
        {error && <div className="error-message" aria-live="polite">{error}</div>}
      </form>

      <div className="register-link">
        Non hai un account? <Link href="/register" prefetch={true}>Registrati</Link>
      </div>
    </div>
  );
};

export default LoginComponent;