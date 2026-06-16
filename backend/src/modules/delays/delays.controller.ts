// Delays Controller - Sistema de Atraso
// Gerencia registro de entrada tardia de alunos e funcionários

import { Router, Request, Response, NextFunction } from "express";
import prisma from "../../lib/prisma";
import { validate } from "../../lib/validation";
import { authenticate } from "../../middleware/auth";
import { requirePermission } from "../../middleware/rbac";
import { createStudentDelaySchema, createUserDelaySchema } from "./delays.schema";
import { NotFoundError } from "../../lib/errors";

const router = Router();

// ============================================================
// GET /api/delays - Lista todos os registros de atraso
// ============================================================
router.get(
  "/",
  authenticate,
  requirePermission("read_all"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const delays = await prisma.delay.findMany({
        include: {
          student: { select: { id: true, nome: true, turma: true, periodo: true } },
          user: { select: { id: true, name: true } },
        },
        orderBy: { horarioAtraso: "desc" },
        take: 100,
      });

      res.json(delays);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// POST /api/delays/student - Registra atraso de aluno
// ============================================================
router.post(
  "/student",
  authenticate,
  requirePermission("write_atrasos"),
  validate(createStudentDelaySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { studentId, justificativa } = req.body;

      // Verifica se o aluno existe
      const student = await prisma.student.findUnique({ where: { id: studentId } });
      if (!student) throw new NotFoundError("Aluno não encontrado");

      // Cria o registro de atraso com horário atual
      const delay = await prisma.delay.create({
        data: {
          studentId,
          justificativa: justificativa || null,
          horarioAtraso: new Date(),
        },
        include: {
          student: { select: { id: true, nome: true, turma: true, periodo: true } },
        },
      });

      // Retorna também um comprovante digital
      res.status(201).json({
        ...delay,
        comprovante: {
          tipo: "ATRASO_ALUNO",
          data: delay.horarioAtraso,
          aluno: delay.student?.nome,
          protocolo: delay.id,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// POST /api/delays/employee - Registra atraso de funcionário
// ============================================================
router.post(
  "/employee",
  authenticate,
  requirePermission("write_atrasos"),
  validate(createUserDelaySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, justificativa } = req.body;

      // Verifica se o funcionário existe
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundError("Funcionário não encontrado");

      // Cria o registro de atraso
      const delay = await prisma.delay.create({
        data: {
          userId,
          justificativa: justificativa || null,
          horarioAtraso: new Date(),
        },
        include: {
          user: { select: { id: true, name: true } },
        },
      });

      res.status(201).json({
        ...delay,
        comprovante: {
          tipo: "ATRASO_FUNCIONARIO",
          data: delay.horarioAtraso,
          funcionario: delay.user?.name,
          protocolo: delay.id,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
