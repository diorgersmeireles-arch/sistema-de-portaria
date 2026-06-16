// App - Configuração de rotas e providers do sistema

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/pages/Login";
import { DashboardPage } from "@/pages/Dashboard";
import { StudentsPage } from "@/pages/students/StudentsPage";
import { GuardiansPage } from "@/pages/guardians/GuardiansPage";
import { VisitorsPage } from "@/pages/visitors/VisitorsPage";
import { SuppliersPage } from "@/pages/suppliers/SuppliersPage";
import { KeysPage } from "@/pages/keys/KeysPage";
import { DelaysPage } from "@/pages/delays/DelaysPage";
import { VisitsPage } from "@/pages/visits/VisitsPage";
import { CamerasPage } from "@/pages/cameras/CamerasPage";
import { BellPage } from "@/pages/bell/BellPage";
import type { ReactNode } from "react";

// Cria instância do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Guard de rota: redireciona para login se não autenticado
 */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * Componente principal de rotas
 */
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Rota de login - redireciona para dashboard se já estiver logado */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />

      {/* Rotas protegidas dentro do AppShell */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/guardians" element={<GuardiansPage />} />
        <Route path="/visitors" element={<VisitorsPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/keys" element={<KeysPage />} />
        <Route path="/delays" element={<DelaysPage />} />
        <Route path="/visits" element={<VisitsPage />} />
        <Route path="/cameras" element={<CamerasPage />} />
        <Route path="/bell" element={<BellPage />} />
      </Route>

      {/* Rota fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Aplicação principal
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
