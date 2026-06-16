// Auth Controller - Endpoints de autenticação
// Gerencia login, criação de usuários e informações do perfil atual

import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma";
import { generateToken } from "../../lib/jwt";
import { validate } from "../../lib/validation";
import { authenticate } from "../../middleware/auth";
import { requirePermission } from "../../middleware/rbac";
import { loginSchema, createUserSchema } from "./auth.schema";
import { NotFoundError, UnauthorizedError, ConflictError } from "../../lib/errors";

const router = Router();

// ============================================================
// POST /api/auth/login - Autenticação do usuário
// Valida credenciais e retorna token JWT
// ============================================================
router.post("/login", validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Busca o usuário pelo email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    // Verifica se o usuário está ativo
    if (!user.isActive) {
      throw new UnauthorizedError("Usuário desativado. Contate o administrador.");
    }

    // Compara a senha fornecida com o hash armazenado
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    // Gera o token JWT com as informações do usuário
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Retorna token e dados básicos do usuário
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// GET /api/auth/me - Retorna dados do usuário logado
// Requer autenticação via token JWT
// ============================================================
router.get("/me", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// ============================================================
// POST /api/auth/users - Cria novo usuário (apenas Superadmin)
// Permite que superadmins gerenciem outros usuários do sistema
// ============================================================
router.post(
  "/users",
  authenticate,
  requirePermission("all"),
  validate(createUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name, role } = req.body;

      // Verifica se o email já está em uso
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new ConflictError("Email já cadastrado no sistema");
      }

      // Hash da senha com bcrypt (salt rounds = 12)
      const passwordHash = await bcrypt.hash(password, 12);

      // Cria o usuário no banco
      const user = await prisma.user.create({
        data: { email, passwordHash, name, role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// GET /api/auth/users - Lista todos os usuários (Superadmin)
// ============================================================
router.get(
  "/users",
  authenticate,
  requirePermission("all"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      res.json(users);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
