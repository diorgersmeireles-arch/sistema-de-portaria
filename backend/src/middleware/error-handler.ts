// Error Handler Middleware - Tratamento global de erros
// Captura e formata todos os erros da aplicação de forma padronizada

import { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/errors";

/**
 * Middleware de tratamento global de erros
 * Deve ser registrado APÓS todas as rotas
 * Formata a resposta de erro no padrão JSON consistente
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log do erro em desenvolvimento
  if (process.env.NODE_ENV === "development") {
    console.error("[ERROR]", err);
  }

  // Erro operacional conhecido (AppError ou subclasses)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
    return;
  }

  // Erro inesperado - não expõe detalhes internos em produção
  res.status(500).json({
    error: {
      message:
        process.env.NODE_ENV === "production"
          ? "Erro interno do servidor"
          : err.message || "Erro interno do servidor",
      statusCode: 500,
    },
  });
}
