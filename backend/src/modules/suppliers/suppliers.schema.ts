// Suppliers Schemas - Validação Zod para o módulo de fornecedores
// Inclui regra de negócio de renovação a cada 6 meses

import { z } from "zod";

// Schema para criação de fornecedor
export const createSupplierSchema = z.object({
  empresa: z.string().min(3, "Empresa deve ter no mínimo 3 caracteres"),
  nomeRepresentante: z.string().min(3, "Nome do representante deve ter no mínimo 3 caracteres"),
  documento: z.string().min(4, "Documento deve ter no mínimo 4 caracteres"),
  fotoUrl: z.string().url("URL da foto inválida").optional().nullable(),
  lastRenewal: z.string().datetime({ message: "Data de renovação inválida" }).optional(),
});

// Schema para atualização de fornecedor
export const updateSupplierSchema = createSupplierSchema.partial();
