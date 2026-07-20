import type { ApiErrorShape } from '@learning-hub/core';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}
type ApiError = AxiosError<{ error?: string }> & ApiErrorShape;

const api = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let refreshPromise: Promise<void> | null = null;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MAX_REFRESH_RETRIES = 2;
const BASE_RETRY_DELAY = 500;

const doRefresh = (): Promise<void> => {
  if (refreshPromise) return refreshPromise;

  let attempts = 0;

  const attempt = async (): Promise<void> => {
    try {
      await api.post('/api/auth/refresh');
    } catch {
      if (attempts < MAX_REFRESH_RETRIES) {
        attempts++;
        await sleep(BASE_RETRY_DELAY * Math.pow(2, attempts - 1));
        return attempt();
      }
      if (typeof window !== 'undefined') window.location.href = '/auth';
      throw new Error('Refresh failed');
    }
  };

  refreshPromise = attempt().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

export const refreshAccessToken = (): Promise<void> => doRefresh();

const makeErrorHandler = (instance: typeof api) => async (error: ApiError) => {
  const originalRequest = error.config as RetryConfig | undefined;
  const is401 =
    error.response?.status === 401 ||
    error.response?.data?.error === 'Unauthorized';
  if (is401 && originalRequest && !originalRequest._retry) {
    originalRequest._retry = true;
    try {
      await doRefresh();
      return instance(originalRequest);
    } catch {
      // doRefresh already redirects
    }
  }
  return Promise.reject(error);
};

api.interceptors.response.use((r) => r, makeErrorHandler(api));

export default api;
