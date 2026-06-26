import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    headers: { 'Content-Type': 'application/json' },
});

// ponytail: in-memory + localStorage so token survives page refresh
let accessToken: string | null =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

export const setAccessToken = (token: string | null) => {
    accessToken = token;
    if (typeof window !== 'undefined') {
        if (token) localStorage.setItem('accessToken', token);
        else localStorage.removeItem('accessToken');
    }
};

api.interceptors.request.use((config) => {
    if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken =
                typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
            if (refreshToken) {
                try {
                    const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
                        refreshToken,
                    });
                    const { accessToken: newToken, refreshToken: newRefresh } = res.data;
                    setAccessToken(newToken);
                    localStorage.setItem('refreshToken', newRefresh);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                } catch {
                    setAccessToken(null);
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    if (typeof window !== 'undefined') window.location.href = '/auth';
                }
            } else {
                if (typeof window !== 'undefined') window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
