// Students Schemas - Validação Zod para o módulo de alunos

import { z } from "zod";
import { Periodo } from "@prisma/client";

// Schema para criação de aluno
export const createStudentSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  turma: z.string().min(1, "Turma é obrigatória"),
  periodo: z.nativeEnum(Periodo, {
    errorMap: () => ({ message: "Período deve ser MANHA ou TARDE" }),
  }),
});

// Schema para atualização de aluno
export const updateStudentSchema = createStudentSchema.partial();

// Schema para vincular responsáveis a um aluno
export const linkGuardiansSchema = z.object({
  guardianIds: z.array(z.string().uuid()).min(1, "Pelo menos um responsável deve ser vinculado"),
});
