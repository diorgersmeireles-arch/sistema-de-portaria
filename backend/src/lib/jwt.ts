// JWT Utilities - Geração e verificação de tokens JWT
// Responsável pela autenticação stateless do sistema

import jwt from "jsonwebtoken";

// Constantes de configuração do JWT
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

// Interface do payload decodificado do token JWT
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Gera um token JWT para o usuário autenticado
 * @param payload - Dados do usuário para codificar no token
 * @returns Token JWT assinado
 */
export function generateToken(payload: JwtPayload): string {
  // Garante que expiresIn seja tratado como string para o tipo esperado
  const options: jwt.SignOptions = {
    expiresIn: JWT_EXPIRES_IN as string & jwt.SignOptions["expiresIn"],
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verifica e decodifica um token JWT
 * @param token - Token JWT a ser verificado
 * @returns Payload decodificado ou null se inválido/expirado
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
