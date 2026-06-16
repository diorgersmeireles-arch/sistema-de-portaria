// Visit Schedules Controller - Sistema de Agendamento de Visitas
// Gerencia pré-agendamento de reuniões e visitas institucionais

import { Router, Request, Response, NextFunction } from "express";
import prisma from "../../lib/prisma";
import { validate } from "../../lib/validation";
import { authenticate } from "../../middleware/auth";
import { requirePermission } from "../../middleware/rbac";
import {
  createVisitScheduleSchema,
  updateVisitScheduleSchema,
} from "./visit-schedules.schema";
import { NotFoundError } from "../../lib/errors";

const router = Router();

// ============================================================
// GET /api/visit-schedules - Lista agendamentos
// Suporta filtro por data e status via query params
// ============================================================
router.get(
  "/",
  authenticate,
  requirePermission("read_all"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, status } = req.query;

      // Monta filtros dinâmicos
      const where: any = {};
      if (status) where.status = status as string;
      if (data) {
        const dataInicio = new Date(data as string);
        const dataFim = new Date(dataInicio);
        dataFim.setDate(dataFim.getDate() + 1);
        where.dataHoraAgendada = { gte: dataInicio, lt: dataFim };
      }

      const schedules = await prisma.visitSchedule.findMany({
        where,
        orderBy: { dataHoraAgendada: "asc" },
      });

      res.json(schedules);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// GET /api/visit-schedules/today - Agendamentos do dia
// Para validação rápida na portaria
// ============================================================
router.get(
  "/today",
  authenticate,
  requirePermission("read_all"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const hoje = new Date();
      const hojeFim = new Date(hoje);
      hojeFim.setHours(23, 59, 59, 999);

      const schedules = await prisma.visitSchedule.findMany({
        where: {
          dataHoraAgendada: { gte: hoje, lte: hojeFim },
          status: "PENDENTE",
        },
        orderBy: { dataHoraAgendada: "asc" },
      });

      res.json(schedules);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// GET /api/visit-schedules/:id - Detalhes do agendamento
// ============================================================
router.get(
  "/:id",
  authenticate,
  requirePermission("read_all"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schedule = await prisma.visitSchedule.findUnique({
        where: { id: req.params.id },
      });
      if (!schedule) throw new NotFoundError("Agendamento não encontrado");
      res.json(schedule);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// POST /api/visit-schedules - Cria novo agendamento
// ============================================================
router.post(
  "/",
  authenticate,
  requirePermission("write_agendamentos"),
  validate(createVisitScheduleSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = {
        ...req.body,
        dataHoraAgendada: new Date(req.body.dataHoraAgendada),
      };

      const schedule = await prisma.visitSchedule.create({ data });
      res.status(201).json(schedule);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// PUT /api/visit-schedules/:id - Atualiza agendamento
// ============================================================
router.put(
  "/:id",
  authenticate,
  requirePermission("write_agendamentos"),
  validate(updateVisitScheduleSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: any = { ...req.body };
      if (data.dataHoraAgendada) {
        data.dataHoraAgendada = new Date(data.dataHoraAgendada);
      }

      const schedule = await prisma.visitSchedule.update({
        where: { id: req.params.id },
        data,
      });
      res.json(schedule);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// DELETE /api/visit-schedules/:id - Remove agendamento
// ============================================================
router.delete(
  "/:id",
  authenticate,
  requirePermission("write_agendamentos"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.visitSchedule.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
