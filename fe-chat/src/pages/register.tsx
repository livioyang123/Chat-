"use client";
import { useState, useCallback, useEffect } from 'react';
import { AuthService } from '@/services';

import { useRouter } from 'next/router';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });

  useEffect(() => {
    router.prefetch('/');
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await AuthService.register(formData); 
      router.replace('/'); 
    } catch (error) {
      if (error instanceof Error) {
        setError("Errore durante la registrazione: Username già in uso");
      } else {
        setError('Errore durante la registrazione. Riprova.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  return (
    <main>
      <div className="register-container">
        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            name="username"
            placeholder="username"
            value={formData.username}
            onChange={handleChange}
            required
            autoComplete="username"
          />
          <input
            type="email"
            name="email"
            placeholder="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
          <input
            type="password"
            name="password"
            placeholder="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Caricamento...' : 'Crea account'}
          </button>
          <button
            type="button"
            className="login-button"
            onClick={() => router.replace("/")}
          >
            torna indietro
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </main>
  );
}