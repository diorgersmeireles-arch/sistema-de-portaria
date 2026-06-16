// API Client - Instância do Axios configurada para comunicação com o backend

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

/**
 * Cria a instância do Axios com a base URL da API
 * Usa o proxy configurado no Vite para desenvolvimento
 */
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor de requisição: adiciona o token JWT automaticamente
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("@portaria:token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de resposta: trata erros comuns
 * - 401: token inválido/expirado -> redireciona para login
 * - 403: sem permissão
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error: { message: string } }>) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado - limpa sessão e redireciona
      localStorage.removeItem("@portaria:token");
      localStorage.removeItem("@portaria:user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
