import { useEffect, useState, type ReactNode } from "react";

import { getCurrentUser, logoutUser } from "@/api/auth.api";
import type { AdminUser } from "@/interface/auth.interface";
import { AuthContext } from "./AuthContext";

const clearTokens = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const accessToken = localStorage.getItem("access");
      const refreshToken = localStorage.getItem("refresh");
      if (!accessToken || !refreshToken) {
        clearTokens();
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (!currentUser.is_staff) {
          throw new Error("This account does not have dashboard access.");
        }
        setUser(currentUser);
      } catch {
        clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void checkSession();
  }, []);

  const login = (
    access: string,
    refresh: string,
    adminUser: AdminUser
  ) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    setUser(adminUser);
  };

  const logout = async () => {
    try {
      if (localStorage.getItem("access")) {
        await logoutUser();
      }
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(user),
        isLoading,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
