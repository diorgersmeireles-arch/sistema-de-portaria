// Auth Schemas - Esquemas de validação Zod para autenticação
// Define as regras de validação para login e criação de usuários

import { z } from "zod";
import { Role } from "@prisma/client";

// Schema de validação para login
export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email é obrigatório" })
    .email("Email inválido"),
  password: z
    .string({ required_error: "Senha é obrigatória" })
    .min(6, "Senha deve ter no mínimo 6 caracteres"),
});

// Schema de validação para criação de usuário (Superadmin)
export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  role: z.nativeEnum(Role, {
    errorMap: () => ({ message: "Role inválida" }),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
