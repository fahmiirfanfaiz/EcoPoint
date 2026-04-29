"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthUser, getStoredAuth, clearStoredAuth } from "@/lib/auth";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const syncAuth = () => {
      const auth = getStoredAuth();
      if (auth) {
        setToken(auth.token);
        setUser(auth.user);
      } else {
        setToken(null);
        setUser(null);
      }
      setIsLoading(false);
    };

    syncAuth();
    window.addEventListener("ecopoint-auth-changed", syncAuth);

    return () => {
      window.removeEventListener("ecopoint-auth-changed", syncAuth);
    };
  }, []);

  const logout = () => {
    clearStoredAuth();
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
