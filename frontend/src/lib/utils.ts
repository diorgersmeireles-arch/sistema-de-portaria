// Utility functions - Funções auxiliares para o frontend

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes CSS com suporte a Tailwind Merge
 * Resolve conflitos de classes do Tailwind automaticamente
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formata data ISO para string localizada no padrão brasileiro
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Formata data ISO para string localizada com hora
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Retorna o nome da role em português
 */
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    SUPERADMIN: "Superadmin",
    COORDENACAO: "Coordenação",
    SUPERVISAO: "Supervisão",
    SECRETARIA: "Secretaria",
    PORTARIA: "Portaria",
  };
  return labels[role] || role;
}
