// Visitors Controller - CRUD de Visitantes
// Gerencia o registro de visitantes na portaria

import { Router, Request, Response, NextFunction } from "express";
import prisma from "../../lib/prisma";
import { validate } from "../../lib/validation";
import { authenticate } from "../../middleware/auth";
import { requirePermission } from "../../middleware/rbac";
import { createVisitorSchema, updateVisitorSchema } from "./visitors.schema";
import { NotFoundError } from "../../lib/errors";

const router = Router();

router.get(
  "/",
  authenticate,
  requirePermission("read_all"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const visitors = await prisma.visitor.findMany({
        orderBy: { dataEntrada: "desc" },
      });
      res.json(visitors);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:id",
  authenticate,
  requirePermission("read_all"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const visitor = await prisma.visitor.findUnique({
        where: { id: req.params.id },
      });
      if (!visitor) throw new NotFoundError("Visitante não encontrado");
      res.json(visitor);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  authenticate,
  requirePermission("write_visitantes"),
  validate(createVisitorSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const visitor = await prisma.visitor.create({ data: req.body });
      res.status(201).json(visitor);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:id",
  authenticate,
  requirePermission("write_visitantes"),
  validate(updateVisitorSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const visitor = await prisma.visitor.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json(visitor);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  authenticate,
  requirePermission("write_visitantes"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.visitor.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
