// Keys Schemas - Validação Zod para o módulo de chaves

import { z } from "zod";

// Schema para criação de chave
export const createKeySchema = z.object({
  salaSetor: z.string().min(3, "Sala/Setor deve ter no mínimo 3 caracteres"),
  codigoChave: z.string().min(2, "Código da chave deve ter no mínimo 2 caracteres"),
});

// Schema para atualização de chave
export const updateKeySchema = createKeySchema.partial();

// Schema para registrar empréstimo de chave
export const borrowKeySchema = z.object({
  userId: z.string().uuid("ID do usuário inválido"),
});
