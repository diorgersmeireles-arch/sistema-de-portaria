// Auth Middleware - Autenticação via JWT
// Verifica e decodifica o token JWT do header Authorization

import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../lib/jwt";
import { UnauthorizedError } from "../lib/errors";

// Estende a interface Request do Express para incluir os dados do usuário
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware de autenticação obrigatória
 * Verifica a presença e validade do token JWT no header Authorization
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  // Extrai o token do header: "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new UnauthorizedError("Token de autenticação não fornecido"));
  }

  // Formato esperado: "Bearer <token>"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return next(new UnauthorizedError("Formato de token inválido"));
  }

  const token = parts[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return next(new UnauthorizedError("Token inválido ou expirado"));
  }

  // Anexa os dados do usuário à requisição para uso nos handlers
  req.user = decoded;
  next();
}

/**
 * Middleware de autenticação opcional
 * Decodifica o token se presente, mas não bloqueia a requisição
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      const decoded = verifyToken(parts[1]);
      if (decoded) {
        req.user = decoded;
      }
    }
  }

  next();
}
