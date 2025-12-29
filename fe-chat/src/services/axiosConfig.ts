import axios from 'axios';

// Configurazione base di Axios
const api = axios.create({
    baseURL: 'http://localhost:8080/',
    withCredentials: true, // IMPORTANTE: include i cookie in tutte le richieste
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor per gestire risposte non autorizzate
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token scaduto o non valido, reindirizza al login
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;