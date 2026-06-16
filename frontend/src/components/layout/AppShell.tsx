// AppShell - Layout principal do sistema autenticado
// Combina Sidebar + conteúdo + Footer institucional

import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

/**
 * Shell da aplicação que envolve todas as páginas autenticadas
 * Estrutura: Sidebar | Conteúdo Principal | Footer
 */
export function AppShell() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar de navegação */}
      <Sidebar />

      {/* Área de conteúdo principal */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 bg-background">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
