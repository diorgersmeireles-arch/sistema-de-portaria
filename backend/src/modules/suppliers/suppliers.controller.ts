// Suppliers Controller - CRUD de Fornecedores
// Gerencia cadastro de fornecedores com regra de renovação a cada 6 meses

import { Router, Request, Response, NextFunction } from "express";
import prisma from "../../lib/prisma";
import { validate } from "../../lib/validation";
import { authenticate } from "../../middleware/auth";
import { requirePermission } from "../../middleware/rbac";
import { createSupplierSchema, updateSupplierSchema } from "./suppliers.schema";
import { NotFoundError } from "../../lib/errors";

const router = Router();

// ============================================================
// Helper: Calcula o status do fornecedor baseado na última renovação
// Regra de negócio: fotos e registros devem ser renovados a cada 6 meses
// ============================================================
function calculateSupplierStatus(lastRenewal: Date) {
  const hoje = new Date();
  const seisMeses = 180 * 24 * 60 * 60 * 1000; // ~6 meses em milissegundos
  const diff = hoje.getTime() - lastRenewal.getTime();

  if (diff > seisMeses) {
    return "BLOQUEADO_RENOVACAO";
  }
  return "ATIVO";
}

/**
 * Retorna os dias restantes para o vencimento da renovação do fornecedor
 * Valor negativo indica que já está vencido
 */
export function diasParaVencimento(lastRenewal: Date): number {
  const seisMeses = 180 * 24 * 60 * 60 * 1000;
  const vencimento = new Date(lastRenewal.getTime() + seisMeses);
  const diff = vencimento.getTime() - new Date().getTime();
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

// ============================================================
// GET /api/suppliers - Lista todos os fornecedores
// Retorna também o status calculado e dias para vencimento
// ============================================================
router.get(
  "/",
  authenticate,
  requirePermission("read_all"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const suppliers = await prisma.supplier.findMany({
        orderBy: { empresa: "asc" },
      });

      // Aplica regra de negócio: recalcula status e adiciona info de renovação
      const formatted = suppliers.map((supplier) => {
        const statusCalculado = calculateSupplierStatus(supplier.lastRenewal);
        return {
          ...supplier,
          status: statusCalculado,
          diasRestantes: diasParaVencimento(supplier.lastRenewal),
          precisaRenovar: statusCalculado === "BLOQUEADO_RENOVACAO",
        };
      });

      res.json(formatted);
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
      const supplier = await prisma.supplier.findUnique({
        where: { id: req.params.id },
      });
      if (!supplier) throw new NotFoundError("Fornecedor não encontrado");

      const statusCalculado = calculateSupplierStatus(supplier.lastRenewal);
      res.json({
        ...supplier,
        status: statusCalculado,
        diasRestantes: diasParaVencimento(supplier.lastRenewal),
        precisaRenovar: statusCalculado === "BLOQUEADO_RENOVACAO",
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  authenticate,
  requirePermission("write_fornecedores"),
  validate(createSupplierSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = {
        ...req.body,
        // Se não informado, define a data atual como renovação
        lastRenewal: req.body.lastRenewal ? new Date(req.body.lastRenewal) : new Date(),
      };

      const supplier = await prisma.supplier.create({ data });
      res.status(201).json(supplier);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:id",
  authenticate,
  requirePermission("write_fornecedores"),
  validate(updateSupplierSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: any = { ...req.body };
      if (data.lastRenewal) {
        data.lastRenewal = new Date(data.lastRenewal);
      }

      const supplier = await prisma.supplier.update({
        where: { id: req.params.id },
        data,
      });
      res.json(supplier);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  authenticate,
  requirePermission("write_fornecedores"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.supplier.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
