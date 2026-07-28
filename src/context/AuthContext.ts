// src/context/AuthContext.ts
import { createContext } from "react";
import type { AdminUser } from "@/interface/auth.interface";

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AdminUser | null;
  login: (access: string, refresh: string, user: AdminUser) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
