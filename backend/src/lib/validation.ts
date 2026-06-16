// Validation Helpers - Middleware de validação com Zod
// Reutilizável para validar request body, query params e URL params

import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { BadRequestError } from "./errors";

/**
 * Middleware genérico para validação com Zod
 * @param schema - Schema Zod para validar os dados
 * @param source - Fonte dos dados: "body" | "query" | "params"
 */
export function validate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Faz o parse e validação, substituindo pelos dados transformados
      const data = schema.parse(req[source]);
      req[source] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formata os erros do Zod em mensagens legíveis
        const message = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join("; ");
        next(new BadRequestError(message));
      } else {
        next(error);
      }
    }
  };
}
