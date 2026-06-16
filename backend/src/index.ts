// Entry Point - Ponto de entrada do servidor backend
// Inicializa o servidor HTTP, WebSocket e o sinaleiro

import { server, scheduler } from "./app";

const PORT = process.env.PORT || 3001;

// Inicia o servidor na porta configurada
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║  Sistema de Portaria - João XXIII               ║
║  Desenvolvido pela MADev                         ║
║                                                  ║
║  Servidor rodando na porta ${PORT}                 ║
║  API: http://localhost:${PORT}/api                ║
║  WebSocket: ws://localhost:${PORT}                 ║
╚══════════════════════════════════════════════════╝
  `);

  // Inicia o monitoramento dos horários do sinaleiro
  scheduler.start();
});

// Graceful shutdown - encerra conexões de forma segura
process.on("SIGINT", () => {
  console.log("\n[Server] Encerrando servidor...");
  scheduler.stop();
  server.close(() => {
    console.log("[Server] Servidor encerrado com sucesso");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("\n[Server] Encerrando servidor (SIGTERM)...");
  scheduler.stop();
  server.close(() => {
    process.exit(0);
  });
});
