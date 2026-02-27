import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // adjust if backend runs elsewhere
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('lms_token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
