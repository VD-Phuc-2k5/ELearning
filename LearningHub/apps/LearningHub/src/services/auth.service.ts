import { AuthTokens, User } from '@learning-hub/domain';
import { jwtDecode } from 'jwt-decode';
import api, { setAccessToken } from '../lib/api';
import { LoginInput, RegisterInput } from '../lib/schemas';

export type { AuthTokens, User };

export interface RegisterResponse { user: User; }

const AuthService = {
    login: async (data: LoginInput): Promise<AuthTokens> => {
        const response = await api.post('/auth/login', data);
        const { accessToken, refreshToken } = response.data;
        setAccessToken(accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        try {
            const payload = jwtDecode<{ sub: string; email: string }>(accessToken);
            localStorage.setItem('user', JSON.stringify({ id: payload.sub, email: payload.email, username: payload.email.split('@')[0] }));
        } catch {}
        return response.data;
    },

    register: async (data: RegisterInput): Promise<RegisterResponse> => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    logout: async (): Promise<void> => {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
        if (refreshToken) {
            try { await api.post('/auth/logout', { refreshToken }); } catch {}
        }
        setAccessToken(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    },

    getCurrentUser: (): User | null => {
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    },

    isLoggedIn: (): boolean => {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem('accessToken');
    },
};

export default AuthService;
