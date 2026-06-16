// Prisma Client - Instância única do banco de dados
// Garante conexão eficiente com o PostgreSQL via Singleton Pattern

import { PrismaClient } from "@prisma/client";

// Instância global para reuso durante hot-reload em desenvolvimento
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Cria ou reusa a instância do Prisma Client
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
