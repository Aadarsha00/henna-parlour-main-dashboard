import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

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
  timeout: 15_000,
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

const clearSession = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
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
    const refreshToken = localStorage.getItem("refresh");

    if (!refreshToken) {
      processQueue(error);
      clearSession();
      window.location.assign("/login");
      return Promise.reject(error);
    }

    try {
      const response = await axios.post<RefreshResponse>(
        `${API_BASE_URL}/auth/jwt/refresh/`,
        { refresh: refreshToken }
      );
      const { access, refresh: rotatedRefresh } = response.data;
      localStorage.setItem("access", access);
      if (rotatedRefresh) localStorage.setItem("refresh", rotatedRefresh);

      originalRequest.headers.Authorization = `Bearer ${access}`;
      processQueue(null, access);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      clearSession();
      window.location.assign("/login");
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
