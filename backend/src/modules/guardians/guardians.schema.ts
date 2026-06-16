// Guardians Schemas - Validação Zod para o módulo de responsáveis

import { z } from "zod";

// Schema para criação de responsável
export const createGuardianSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  documento: z.string().min(4, "Documento deve ter no mínimo 4 caracteres"),
  contato: z.string().min(8, "Contato deve ter no mínimo 8 caracteres"),
});

// Schema para atualização de responsável
export const updateGuardianSchema = createGuardianSchema.partial();
