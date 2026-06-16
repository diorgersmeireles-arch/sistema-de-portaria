// Visitors Schemas - Validação Zod para o módulo de visitantes

import { z } from "zod";

// Schema para criação de visitante
export const createVisitorSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  documento: z.string().optional().nullable(),
  empresaMotivo: z.string().min(3, "Empresa/Motivo deve ter no mínimo 3 caracteres"),
  fotoUrl: z.string().url("URL da foto inválida").optional().nullable(),
});

// Schema para atualização de visitante
export const updateVisitorSchema = createVisitorSchema.partial();
