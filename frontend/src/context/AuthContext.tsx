// AuthContext - Contexto de autenticação para gerenciar estado do usuário logado

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import api from "@/lib/api";
import type { User, LoginResponse } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Provider de autenticação que gerencia o estado do usuário logado
 * Persiste token e dados no localStorage
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializa o estado a partir do localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("@portaria:token");
    const storedUser = localStorage.getItem("@portaria:user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  /**
   * Login: envia credenciais e salva token + dados do usuário
   */
  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post<LoginResponse>("/auth/login", { email, password });
    const { token: newToken, user: userData } = response.data;

    // Persiste no localStorage
    localStorage.setItem("@portaria:token", newToken);
    localStorage.setItem("@portaria:user", JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
  }, []);

  /**
   * Logout: limpa dados da sessão
   */
  const logout = useCallback(() => {
    localStorage.removeItem("@portaria:token");
    localStorage.removeItem("@portaria:user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de autenticação
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
