// RBAC Middleware - Controle de Acesso Baseado em Funções
// Implementa a matriz de permissões definida no sistema

import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../lib/errors";

// ============================================================
// Matriz de Permissões (RBAC Matrix)
// Define quais recursos cada role pode acessar
// ============================================================
const PERMISSIONS: Record<string, string[]> = {
  SUPERADMIN: ["all"], // Acesso total a todos os recursos
  COORDENACAO: [
    "read_all", "write_alunos", "write_responsaveis",
    "write_atrasos", "write_agendamentos", "read_cameras",
  ],
  SUPERVISAO: [
    "read_all", "write_atrasos", "write_chaves", "read_cameras",
  ],
  SECRETARIA: [
    "read_all", "write_alunos", "write_responsaveis",
    "write_fornecedores", "write_agendamentos",
  ],
  PORTARIA: [
    "read_all", "write_visitantes", "write_fornecedores",
    "write_chaves", "write_atrasos", "read_cameras",
  ],
};

/**
 * Verifica se uma role possui uma permissão específica
 */
function hasPermission(role: string, permission: string): boolean {
  const userPermissions = PERMISSIONS[role];
  if (!userPermissions) return false;
  // "all" concede acesso a tudo
  return userPermissions.includes("all") || userPermissions.includes(permission);
}

/**
 * Factory de middleware RBAC
 * Cria um middleware que verifica se o usuário autenticado possui a permissão necessária
 * @param permission - A permissão requerida para acessar o recurso
 */
export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // Garante que o usuário está autenticado
    if (!req.user) {
      return next(new ForbiddenError("Usuário não autenticado"));
    }

    // Verifica se o usuário possui a permissão necessária
    if (!hasPermission(req.user.role, permission)) {
      return next(
        new ForbiddenError(
          `Acesso negado: função "${req.user.role}" não possui permissão "${permission}"`
        )
      );
    }

    next();
  };
}
