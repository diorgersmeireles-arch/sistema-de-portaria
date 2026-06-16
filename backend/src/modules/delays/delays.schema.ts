// Delays Schemas - Validação Zod para o módulo de atrasos

import { z } from "zod";

// Schema para registro de atraso de aluno
export const createStudentDelaySchema = z.object({
  studentId: z.string().uuid("ID do aluno inválido"),
  justificativa: z.string().optional().nullable(),
});

// Schema para registro de atraso de funcionário
export const createUserDelaySchema = z.object({
  userId: z.string().uuid("ID do usuário inválido"),
  justificativa: z.string().optional().nullable(),
});
