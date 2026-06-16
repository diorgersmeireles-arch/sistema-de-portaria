// Students Controller - CRUD de Alunos
// Gerencia cadastro de alunos e vínculo com responsáveis

import { Router, Request, Response, NextFunction } from "express";
import prisma from "../../lib/prisma";
import { validate } from "../../lib/validation";
import { authenticate } from "../../middleware/auth";
import { requirePermission } from "../../middleware/rbac";
import { createStudentSchema, updateStudentSchema, linkGuardiansSchema } from "./students.schema";
import { NotFoundError } from "../../lib/errors";

const router = Router();

// ============================================================
// GET /api/students - Lista todos os alunos
// Acesso: read_all (todas as roles)
// ============================================================
router.get(
  "/",
  authenticate,
  requirePermission("read_all"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const students = await prisma.student.findMany({
        include: {
          guardians: {
            include: {
              guardian: {
                select: { id: true, nome: true, documento: true, contato: true },
              },
            },
          },
        },
        orderBy: { nome: "asc" },
      });

      // Formata a resposta para incluir responsáveis diretamente
      const formatted = (students as any[]).map((student: any) => ({
        ...student,
        responsaveis: student.guardians.map((sg: any) => sg.guardian),
      }));

      res.json(formatted);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// GET /api/students/:id - Busca aluno por ID
// ============================================================
router.get(
  "/:id",
  authenticate,
  requirePermission("read_all"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const student = await prisma.student.findUnique({
        where: { id: req.params.id },
        include: {
          guardians: {
            include: {
              guardian: true,
            },
          },
        },
      });

      if (!student) {
        throw new NotFoundError("Aluno não encontrado");
      }

      res.json({
        ...student,
        responsaveis: student.guardians.map((sg) => sg.guardian),
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// POST /api/students - Cria novo aluno
// Acesso: write_alunos (Coordenação, Secretaria)
// ============================================================
router.post(
  "/",
  authenticate,
  requirePermission("write_alunos"),
  validate(createStudentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const student = await prisma.student.create({
        data: req.body,
      });

      res.status(201).json(student);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// PUT /api/students/:id - Atualiza dados do aluno
// ============================================================
router.put(
  "/:id",
  authenticate,
  requirePermission("write_alunos"),
  validate(updateStudentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const student = await prisma.student.update({
        where: { id: req.params.id },
        data: req.body,
      });

      res.json(student);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// DELETE /api/students/:id - Remove aluno
// ============================================================
router.delete(
  "/:id",
  authenticate,
  requirePermission("write_alunos"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.student.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// POST /api/students/:id/guardians - Vincula responsáveis ao aluno
// ============================================================
router.post(
  "/:id/guardians",
  authenticate,
  requirePermission("write_alunos"),
  validate(linkGuardiansSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guardianIds } = req.body;

      // Verifica se o aluno existe
      const student = await prisma.student.findUnique({
        where: { id: req.params.id },
      });
      if (!student) {
        throw new NotFoundError("Aluno não encontrado");
      }

      // Cria os vínculos aluno-responsável (ignora se já existir)
      const relations = guardianIds.map((guardianId: string) => ({
        studentId: req.params.id,
        guardianId,
      }));

      for (const rel of relations) {
        await prisma.studentGuardian.upsert({
          where: {
            studentId_guardianId: {
              studentId: rel.studentId,
              guardianId: rel.guardianId,
            },
          },
          update: {},
          create: rel,
        });
      }

      res.status(201).json({ message: "Responsáveis vinculados com sucesso" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
