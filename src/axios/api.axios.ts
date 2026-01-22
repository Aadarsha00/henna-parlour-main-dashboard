/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - adds token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handles token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if it's a 401 error and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if the error is specifically about token expiration
      const errorDetail =
        error.response?.data?.detail || error.response?.data?.code;
      const isTokenExpired =
        errorDetail === "Given token not valid for any token type" ||
        errorDetail === "token_not_valid" ||
        error.response?.data?.messages?.some(
          (msg: any) => msg.message === "Token is expired"
        );

      if (isTokenExpired) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem("refresh");

        if (!refreshToken) {
          // No refresh token, redirect to login
          processQueue(error, null);
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        try {
          // Attempt to refresh the token
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/auth/jwt/refresh/`,
            {
              refresh: refreshToken,
            }
          );

          const { access } = response.data;
          localStorage.setItem("access", access);

          // Update the failed request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;

          processQueue(null, access);

          return api(originalRequest);
        } catch (refreshError: any) {
          // Refresh failed, clear tokens and redirect to login
          processQueue(refreshError, null);
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");

          // Optional: Show error message before redirect
          console.error("Token refresh failed:", refreshError);

          // Redirect to login page
          window.location.href = "/login";

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
