import type { ApiErrorShape } from '@learning-hub/core';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}
type ApiError = AxiosError<{ error?: string }> & ApiErrorShape;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:8080',
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

// ponytail: shared promise prevents parallel refresh calls (token rotation race condition)
let refreshPromise: Promise<string> | null = null;

const doRefresh = (): Promise<string> => {
  if (refreshPromise) return refreshPromise;
  const refreshToken =
    typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  if (!refreshToken) {
    if (typeof window !== 'undefined') window.location.href = '/auth';
    return Promise.reject(new Error('No refresh token'));
  }
  refreshPromise = axios
    .post('/api/auth/refresh', { refreshToken })
    .then((res) => {
      const { accessToken: newToken, refreshToken: newRefresh } = res.data;
      setAccessToken(newToken);
      localStorage.setItem('refreshToken', newRefresh);
      return newToken as string;
    })
    .catch((err) => {
      setAccessToken(null);
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') window.location.href = '/auth';
      throw err;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
};

const makeErrorHandler = (instance: typeof api) => async (error: ApiError) => {
  const originalRequest = error.config as RetryConfig | undefined;
  const is401 =
    error.response?.status === 401 ||
    error.response?.data?.error === 'Unauthorized';
  if (is401 && originalRequest && !originalRequest._retry) {
    originalRequest._retry = true;
    try {
      const newToken = await doRefresh();
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return instance(originalRequest);
    } catch {
      // doRefresh already redirects
    }
  }
  return Promise.reject(error);
};

const attachInterceptors = (instance: typeof api) => {
  instance.interceptors.request.use((config) => {
    if (accessToken && config.headers)
      config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  });
  instance.interceptors.response.use((r) => r, makeErrorHandler(instance));
};

attachInterceptors(api);

export default api;
