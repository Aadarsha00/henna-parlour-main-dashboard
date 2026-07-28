import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  clearStoredSession,
  readStoredSession,
  writeStoredSession,
} from "@/context/auth-storage";
import { resolveApiBaseUrl } from "@/lib/runtime-config.js";

export const API_BASE_URL = resolveApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL,
  import.meta.env.DEV
);
const REQUEST_TIMEOUT_MS = 15_000;

interface TokenErrorResponse {
  detail?: string;
  code?: string;
  messages?: Array<{ message?: string }>;
}

interface RefreshResponse {
  access: string;
  refresh?: string;
}

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = readStoredSession()?.access;
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<TokenErrorResponse>) => {
    const originalRequest = error.config as RetryableRequest | undefined;
    if (!originalRequest) return Promise.reject(error);

    const errorDetail =
      error.response?.data?.detail || error.response?.data?.code;
    const tokenExpired =
      errorDetail === "Given token not valid for any token type" ||
      errorDetail === "token_not_valid" ||
      error.response?.data?.messages?.some(
        (message) => message.message === "Token is expired"
      );

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      !tokenExpired
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string | null>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;
    const currentSession = readStoredSession();
    const refreshToken = currentSession?.refresh;

    if (!refreshToken) {
      processQueue(error);
      clearStoredSession();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
      return Promise.reject(error);
    }

    try {
      const response = await axios.post<RefreshResponse>(
        `${API_BASE_URL}/auth/jwt/refresh/`,
        { refresh: refreshToken },
        { timeout: REQUEST_TIMEOUT_MS }
      );
      const { access, refresh: rotatedRefresh } = response.data;
      writeStoredSession({
        access,
        refresh: rotatedRefresh ?? refreshToken,
      });

      originalRequest.headers.Authorization = `Bearer ${access}`;
      processQueue(null, access);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      clearStoredSession();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
