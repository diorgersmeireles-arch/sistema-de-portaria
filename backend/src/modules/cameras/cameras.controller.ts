// Cameras Controller - Sistema de Câmeras IP
// Gerencia a lista de câmeras para visualização no dashboard em grid

import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../../middleware/auth";
import { requirePermission } from "../../middleware/rbac";

const router = Router();

// ============================================================
// Interface da câmera IP
// Em produção, estas configurações viriam do banco de dados
// ============================================================
interface CameraConfig {
  id: string;
  nome: string;
  ip: string;
  porta: number;
  urlStream: string;
  tipo: string;
  localizacao: string;
  ativa: boolean;
}

// ============================================================
// Configuração mock de câmeras para demonstração
// Em produção: substituir por dados do banco ou serviço externo
// ============================================================
const CAMERAS: CameraConfig[] = [
  {
    id: "1",
    nome: "Portaria Principal",
    ip: "192.168.1.10",
    porta: 554,
    urlStream: "/api/cameras/1/stream", // Proxy ou URL direta RTSP
    tipo: "Hikvision",
    localizacao: "Entrada Principal",
    ativa: true,
  },
  {
    id: "2",
    nome: "Portão de acesso",
    ip: "192.168.1.11",
    porta: 554,
    urlStream: "/api/cameras/2/stream",
    tipo: "Hikvision",
    localizacao: "Portão Lateral",
    ativa: true,
  },
  {
    id: "3",
    nome: "Estacionamento",
    ip: "192.168.1.12",
    porta: 554,
    urlStream: "/api/cameras/3/stream",
    tipo: "Intelbras",
    localizacao: "Estacionamento",
    ativa: true,
  },
  {
    id: "4",
    nome: "Corredor Principal",
    ip: "192.168.1.13",
    porta: 554,
    urlStream: "/api/cameras/4/stream",
    tipo: "Intelbras",
    localizacao: "Corredor Térreo",
    ativa: false,
  },
];

// ============================================================
// GET /api/cameras - Lista todas as câmeras disponíveis
// Retorna URLs seguras (sem expor credenciais) para renderização
// ============================================================
router.get(
  "/",
  authenticate,
  requirePermission("read_cameras"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Em produção: buscar do banco com credenciais seguras
      // Aqui retornamos apenas metadados; o frontend monta a URL
      const camerasSafe = CAMERAS.map((cam) => ({
        id: cam.id,
        nome: cam.nome,
        localizacao: cam.localizacao,
        tipo: cam.tipo,
        ativa: cam.ativa,
        // URL que o frontend usará para conectar via proxy ou diretamente
        url: cam.urlStream,
      }));

      res.json(camerasSafe);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// GET /api/cameras/:id - Detalhes de uma câmera específica
// ============================================================
router.get(
  "/:id",
  authenticate,
  requirePermission("read_cameras"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const camera = CAMERAS.find((c) => c.id === req.params.id);
      if (!camera) {
        return res.status(404).json({ error: { message: "Câmera não encontrada" } });
      }

      res.json({
        id: camera.id,
        nome: camera.nome,
        localizacao: camera.localizacao,
        tipo: camera.tipo,
        ativa: camera.ativa,
        url: camera.urlStream,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
