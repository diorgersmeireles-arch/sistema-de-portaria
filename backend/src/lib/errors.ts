// Error Handling - Classes de erro personalizadas e helpers
// Centraliza o tratamento de erros da aplicação

/**
 * Classe base para erros operacionais da aplicação
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erro 400 - Requisição inválida
 */
export class BadRequestError extends AppError {
  constructor(message: string = "Requisição inválida") {
    super(message, 400);
  }
}

/**
 * Erro 401 - Não autenticado
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Não autorizado") {
    super(message, 401);
  }
}

/**
 * Erro 403 - Proibido (sem permissão)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Acesso proibido") {
    super(message, 403);
  }
}

/**
 * Erro 404 - Não encontrado
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Recurso não encontrado") {
    super(message, 404);
  }
}

/**
 * Erro 409 - Conflito (ex: registro duplicado)
 */
export class ConflictError extends AppError {
  constructor(message: string = "Conflito") {
    super(message, 409);
  }
}
