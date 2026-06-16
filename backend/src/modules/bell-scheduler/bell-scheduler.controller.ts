// Bell Scheduler Controller - Endpoints para consulta dos horários do sinaleiro
// Permite consultar eventos, próximo evento e último evento disparado

import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../../middleware/auth";
import { requirePermission } from "../../middleware/rbac";
import { BellScheduler, BellEvent } from "./bell-scheduler.service";

const router = Router();

// Instância do scheduler (será injetada pelo app principal)
let scheduler: BellScheduler;

/**
 * Define a instância do BellScheduler para este controller
 */
export function setBellScheduler(instance: BellScheduler): void {
  scheduler = instance;
}

// ============================================================
// GET /api/bell-schedule - Lista todos os horários programados
// ============================================================
router.get(
  "/",
  authenticate,
  requirePermission("read_all"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const events = scheduler.getAllEvents();
      res.json({
        events,
        next: scheduler.getNextEvent(),
        last: scheduler.getLastEvent(),
        total: events.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// GET /api/bell-schedule/next - Próximo evento programado
// ============================================================
router.get(
  "/next",
  authenticate,
  requirePermission("read_all"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const next = scheduler.getNextEvent();
      const last = scheduler.getLastEvent();

      res.json({ next, last });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
