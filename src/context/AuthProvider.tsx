import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { getCurrentUser, logoutUser } from "@/api/auth.api";
import type { AdminUser } from "@/interface/auth.interface";
import { ADMIN_SESSION_STORAGE_KEY } from "@/lib/runtime-config.js";
import { AuthContext } from "./AuthContext";
import {
  clearStoredSession,
  readStoredSession,
  writeStoredSession,
} from "./auth-storage";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async (showLoading: boolean) => {
      if (showLoading && isMounted) setIsLoading(true);

      const session = readStoredSession();
      if (!session) {
        if (!isMounted) return;
        queryClient.clear();
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (!currentUser.is_staff) {
          throw new Error("This account does not have dashboard access.");
        }
        if (isMounted) setUser(currentUser);
      } catch {
        clearStoredSession();
        if (isMounted) {
          queryClient.clear();
          setUser(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === ADMIN_SESSION_STORAGE_KEY) {
        queryClient.clear();
        void checkSession(false);
      }
    };

    void checkSession(true);
    window.addEventListener("storage", handleStorage);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorage);
    };
  }, [queryClient]);

  const login = (
    access: string,
    refresh: string,
    adminUser: AdminUser
  ) => {
    queryClient.clear();
    writeStoredSession({ access, refresh });
    setUser(adminUser);
  };

  const logout = async () => {
    const session = readStoredSession();
    clearStoredSession();
    queryClient.clear();
    setUser(null);

    if (!session?.access) return;

    try {
      await logoutUser(session.access);
    } catch {
      // Local logout is immediate even if the API is temporarily unavailable.
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
