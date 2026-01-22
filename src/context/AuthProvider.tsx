/* eslint-disable @typescript-eslint/no-unused-vars */
// src/context/AuthProvider.tsx
import React, { useState, useEffect } from "react";
import api from "@/axios/api.axios";
import { AuthContext } from "./AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkToken = async () => {
    const token = localStorage.getItem("access");
    const refreshToken = localStorage.getItem("refresh");

    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      // Try to make a simple request to verify token
      await api.get("/auth/users/me/"); // or any protected endpoint
      setIsAuthenticated(true);
    } catch (error) {
      // Token might be expired, try to refresh
      if (refreshToken) {
        try {
          const response = await api.post("/auth/jwt/refresh/", {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access;
          localStorage.setItem("access", newAccessToken);
          setIsAuthenticated(true);
        } catch (refreshError) {
          // Refresh failed, clear tokens
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          setIsAuthenticated(false);
        }
      } else {
        // No refresh token, clear everything
        localStorage.removeItem("access");
        setIsAuthenticated(false);
      }
    }

    setIsLoading(false);
  };

  const login = (access: string, refresh: string) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsAuthenticated(false);
  };

  useEffect(() => {
    checkToken();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
