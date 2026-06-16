// App - Configuração principal do servidor Express
// Centraliza middlewares, rotas, WebSocket e inicialização

import express from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

import { errorHandler } from "./middleware/error-handler";

// Importação dos controllers (rotas)
import authController from "./modules/auth/auth.controller";
import studentsController from "./modules/students/students.controller";
import guardiansController from "./modules/guardians/guardians.controller";
import visitorsController from "./modules/visitors/visitors.controller";
import suppliersController from "./modules/suppliers/suppliers.controller";
import keysController from "./modules/keys/keys.controller";
import delaysController from "./modules/delays/delays.controller";
import visitSchedulesController from "./modules/visit-schedules/visit-schedules.controller";
import camerasController from "./modules/cameras/cameras.controller";
import bellSchedulerController, { setBellScheduler } from "./modules/bell-scheduler/bell-scheduler.controller";
import { BellScheduler } from "./modules/bell-scheduler/bell-scheduler.service";

// Criação da aplicação Express e servidor HTTP
const app = express();
const server = http.createServer(app);

// ============================================================
// Configuração CORS - permite requisições do frontend
// ============================================================
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

// ============================================================
// Segurança com Helmet
// ============================================================
app.use(helmet());

// ============================================================
// Parse de JSON com limite de 10MB (para fotos em base64)
// ============================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ============================================================
// Health Check
// ============================================================
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============================================================
// Registro de Rotas da API
// Cada módulo é montado em seu prefixo correspondente
// ============================================================
app.use("/api/auth", authController);
app.use("/api/students", studentsController);
app.use("/api/guardians", guardiansController);
app.use("/api/visitors", visitorsController);
app.use("/api/suppliers", suppliersController);
app.use("/api/keys", keysController);
app.use("/api/delays", delaysController);
app.use("/api/visit-schedules", visitSchedulesController);
app.use("/api/cameras", camerasController);
app.use("/api/bell-schedule", bellSchedulerController);

// ============================================================
// Middleware de tratamento de erros (deve ser o último)
// ============================================================
app.use(errorHandler);

// ============================================================
// Configuração do WebSocket (Socket.IO) para eventos em tempo real
// Usado para: sinaleiro, notificações do sistema
// ============================================================
const io = new SocketIOServer(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Conexão WebSocket - gerencia clientes conectados
io.on("connection", (socket) => {
  console.log(`[Socket.IO] Cliente conectado: ${socket.id}`);

  // Envia a lista de eventos ao conectar
  socket.emit("bell-events", {
    events: scheduler.getAllEvents(),
    nextEvent: scheduler.getNextEvent(),
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.IO] Cliente desconectado: ${socket.id}`);
  });
});

// ============================================================
// Inicialização do Sinaleiro
// ============================================================
const scheduler = new BellScheduler(io);
setBellScheduler(scheduler);

// Objeto com app, server, io e scheduler para uso no index.ts
export { app, server, io, scheduler };
