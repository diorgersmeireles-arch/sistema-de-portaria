// Keys Controller - Sistema de Empréstimo de Chaves
// Gerencia cadastro, retirada, devolução e histórico de chaves

import { Router, Request, Response, NextFunction } from "express";
import prisma from "../../lib/prisma";
import { validate } from "../../lib/validation";
import { authenticate } from "../../middleware/auth";
import { requirePermission } from "../../middleware/rbac";
import { createKeySchema, updateKeySchema } from "./keys.schema";
import { NotFoundError, BadRequestError } from "../../lib/errors";

const router = Router();

// ============================================================
// GET /api/keys - Lista todas as chaves com status atual
// ============================================================
router.get(
  "/",
  authenticate,
  requirePermission("read_all"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const keys = await prisma.key.findMany({
        include: {
          logs: {
            where: { returnedAt: null },
            include: {
              user: { select: { id: true, name: true } },
            },
            take: 1,
          },
        },
        orderBy: { salaSetor: "asc" },
      });

      // Formata para mostrar quem está com a chave atualmente
      const formatted = keys.map((key) => ({
        ...key,
        usuarioAtual: key.logs[0]?.user || null,
        logs: undefined,
      }));

      res.json(formatted);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// GET /api/keys/:id - Detalhes da chave com histórico
// ============================================================
router.get(
  "/:id",
  authenticate,
  requirePermission("read_all"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = await prisma.key.findUnique({
        where: { id: req.params.id },
        include: {
          logs: {
            include: {
              user: { select: { id: true, name: true } },
            },
            orderBy: { borrowedAt: "desc" },
          },
        },
      });

      if (!key) throw new NotFoundError("Chave não encontrada");

      res.json(key);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// POST /api/keys - Cadastra nova chave
// ============================================================
router.post(
  "/",
  authenticate,
  requirePermission("write_chaves"),
  validate(createKeySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = await prisma.key.create({ data: req.body });
      res.status(201).json(key);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// PUT /api/keys/:id - Atualiza dados da chave
// ============================================================
router.put(
  "/:id",
  authenticate,
  requirePermission("write_chaves"),
  validate(updateKeySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = await prisma.key.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json(key);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// DELETE /api/keys/:id - Remove chave
// ============================================================
router.delete(
  "/:id",
  authenticate,
  requirePermission("write_chaves"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.key.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// POST /api/keys/:id/borrow - Retirada de chave
// ============================================================
router.post(
  "/:id/borrow",
  authenticate,
  requirePermission("write_chaves"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const keyId = req.params.id;

      // Verifica se a chave existe e está disponível
      const key = await prisma.key.findUnique({ where: { id: keyId } });
      if (!key) throw new NotFoundError("Chave não encontrada");
      if (key.status !== "DISPONIVEL") {
        throw new BadRequestError("Chave já está emprestada");
      }

      // userId pode vir do body ou do token (para portaria retirar para outro)
      const userId = req.body.userId || req.user!.userId;

      // Atualiza status da chave e cria log de empréstimo
      const [updatedKey, log] = await prisma.$transaction([
        prisma.key.update({
          where: { id: keyId },
          data: { status: "EMPRESTADA" },
        }),
        prisma.keyLog.create({
          data: {
            keyId,
            userId,
          },
        }),
      ]);

      res.status(201).json({ key: updatedKey, log });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// POST /api/keys/:id/return - Devolução de chave
// ============================================================
router.post(
  "/:id/return",
  authenticate,
  requirePermission("write_chaves"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const keyId = req.params.id;

      // Verifica se a chave existe e está emprestada
      const key = await prisma.key.findUnique({ where: { id: keyId } });
      if (!key) throw new NotFoundError("Chave não encontrada");
      if (key.status !== "EMPRESTADA") {
        throw new BadRequestError("Chave não está emprestada");
      }

      // Localiza o log de empréstimo ativo (sem devolução)
      const activeLog = await prisma.keyLog.findFirst({
        where: { keyId, returnedAt: null },
      });
      if (!activeLog) {
        throw new BadRequestError("Nenhum empréstimo ativo encontrado para esta chave");
      }

      // Atualiza status da chave e registra devolução
      const [updatedKey, updatedLog] = await prisma.$transaction([
        prisma.key.update({
          where: { id: keyId },
          data: { status: "DISPONIVEL" },
        }),
        prisma.keyLog.update({
          where: { id: activeLog.id },
          data: { returnedAt: new Date() },
        }),
      ]);

      res.json({ key: updatedKey, log: updatedLog });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// GET /api/keys/logs/history - Histórico completo de movimentações
// ============================================================
router.get(
  "/logs/history",
  authenticate,
  requirePermission("read_all"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const logs = await prisma.keyLog.findMany({
        include: {
          key: { select: { id: true, salaSetor: true, codigoChave: true } },
          user: { select: { id: true, name: true } },
        },
        orderBy: { borrowedAt: "desc" },
        take: 100,
      });

      res.json(logs);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
