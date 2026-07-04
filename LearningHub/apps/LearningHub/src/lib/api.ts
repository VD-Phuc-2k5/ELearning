import type { ApiErrorShape } from '@learning-hub/core';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { cookie } from '@learning-hub/core';

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}
type ApiError = AxiosError<{ error?: string }> & ApiErrorShape;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MAX_REFRESH_RETRIES = 2;
const BASE_RETRY_DELAY = 500;

const doRefresh = (): Promise<string> => {
  if (refreshPromise) return refreshPromise;

  let attempts = 0;

  const attempt = async (): Promise<string> => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' });
      if (!res.ok) throw new Error('Refresh failed');
      const data = await res.json();
      return data.accessToken as string;
    } catch (err) {
      if (attempts < MAX_REFRESH_RETRIES) {
        attempts++;
        await sleep(BASE_RETRY_DELAY * Math.pow(2, attempts - 1));
        return attempt();
      }
      if (typeof window !== 'undefined') window.location.href = '/auth';
      throw err;
    }
  };

  refreshPromise = attempt().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

export const refreshAccessToken = (): Promise<string> => doRefresh();

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

api.interceptors.request.use((config) => {
  const token = cookie.read('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use((r) => r, makeErrorHandler(api));

export default api;
