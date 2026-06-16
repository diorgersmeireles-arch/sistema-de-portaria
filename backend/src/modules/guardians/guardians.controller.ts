// Guardians Controller - CRUD de Responsáveis
// Gerencia cadastro de pais/responsáveis com vínculo N:N com alunos

import { Router, Request, Response, NextFunction } from "express";
import prisma from "../../lib/prisma";
import { validate } from "../../lib/validation";
import { authenticate } from "../../middleware/auth";
import { requirePermission } from "../../middleware/rbac";
import { createGuardianSchema, updateGuardianSchema } from "./guardians.schema";
import { NotFoundError } from "../../lib/errors";

const router = Router();

// ============================================================
// GET /api/guardians - Lista todos os responsáveis
// ============================================================
router.get(
  "/",
  authenticate,
  requirePermission("read_all"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const guardians = await prisma.guardian.findMany({
        include: {
          students: {
            include: {
              student: {
                select: { id: true, nome: true, turma: true, periodo: true },
              },
            },
          },
        },
        orderBy: { nome: "asc" },
      });

      // Formata para incluir alunos vinculados
      const formatted = guardians.map((g) => ({
        ...g,
        alunosVinculados: g.students.map((sg) => sg.student),
      }));

      res.json(formatted);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// GET /api/guardians/:id - Busca responsável por ID
// ============================================================
router.get(
  "/:id",
  authenticate,
  requirePermission("read_all"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const guardian = await prisma.guardian.findUnique({
        where: { id: req.params.id },
        include: {
          students: {
            include: { student: true },
          },
        },
      });

      if (!guardian) {
        throw new NotFoundError("Responsável não encontrado");
      }

      res.json({
        ...guardian,
        alunosVinculados: guardian.students.map((sg) => sg.student),
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// POST /api/guardians - Cria novo responsável
// ============================================================
router.post(
  "/",
  authenticate,
  requirePermission("write_responsaveis"),
  validate(createGuardianSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const guardian = await prisma.guardian.create({
        data: req.body,
      });

      res.status(201).json(guardian);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// PUT /api/guardians/:id - Atualiza dados do responsável
// ============================================================
router.put(
  "/:id",
  authenticate,
  requirePermission("write_responsaveis"),
  validate(updateGuardianSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const guardian = await prisma.guardian.update({
        where: { id: req.params.id },
        data: req.body,
      });

      res.json(guardian);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// DELETE /api/guardians/:id - Remove responsável
// ============================================================
router.delete(
  "/:id",
  authenticate,
  requirePermission("write_responsaveis"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.guardian.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
