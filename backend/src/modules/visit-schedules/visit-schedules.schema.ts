// Visit Schedules Schemas - Validação Zod para agendamento de visitas

import { z } from "zod";
import { VisitStatus } from "@prisma/client";

// Schema para criação de agendamento
export const createVisitScheduleSchema = z.object({
  nomeVisitante: z.string().min(3, "Nome do visitante deve ter no mínimo 3 caracteres"),
  documento: z.string().optional().nullable(),
  dataHoraAgendada: z.string().datetime({ message: "Data/hora inválida" }),
  setorDestino: z.string().min(3, "Setor de destino deve ter no mínimo 3 caracteres"),
  observacoes: z.string().optional().nullable(),
});

// Schema para atualização de agendamento
export const updateVisitScheduleSchema = z.object({
  nomeVisitante: z.string().min(3).optional(),
  documento: z.string().optional().nullable(),
  dataHoraAgendada: z.string().datetime().optional(),
  setorDestino: z.string().min(3).optional(),
  status: z.nativeEnum(VisitStatus).optional(),
  observacoes: z.string().optional().nullable(),
});
