// Sidebar - Navegação lateral do sistema
// Exibe os módulos disponíveis baseados no papel do usuário

import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Zap,
  Users,
  UserCheck,
  UserPlus,
  Truck,
  Key,
  Clock,
  CalendarCheck,
  Camera,
  Bell,
  LogOut,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  permission?: string; // Permissão necessária (null = qualquer autenticado)
}

// Itens de navegação disponíveis no sistema
const navItems: NavItem[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Ações Rápidas", path: "/quick-actions", icon: Zap, permission: "write_visitantes" },
  { label: "Alunos", path: "/students", icon: Users, permission: "write_alunos" },
  { label: "Responsáveis", path: "/guardians", icon: UserCheck, permission: "write_responsaveis" },
  { label: "Visitantes", path: "/visitors", icon: UserPlus, permission: "write_visitantes" },
  { label: "Fornecedores", path: "/suppliers", icon: Truck, permission: "write_fornecedores" },
  { label: "Chaves", path: "/keys", icon: Key, permission: "write_chaves" },
  { label: "Atrasos", path: "/delays", icon: Clock, permission: "write_atrasos" },
  { label: "Agendamentos", path: "/visits", icon: CalendarCheck, permission: "write_agendamentos" },
  { label: "Câmeras", path: "/cameras", icon: Camera, permission: "read_cameras" },
  { label: "Sinaleiro", path: "/bell", icon: Bell },
];

// Mapeamento de permissões por role
const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPERADMIN: ["all"],
  COORDENACAO: ["write_alunos", "write_responsaveis", "write_atrasos", "write_agendamentos", "read_cameras"],
  SUPERVISAO: ["write_atrasos", "write_chaves", "read_cameras"],
  SECRETARIA: ["write_alunos", "write_responsaveis", "write_fornecedores", "write_agendamentos"],
  PORTARIA: ["write_visitantes", "write_fornecedores", "write_chaves", "write_atrasos", "read_cameras"],
};

export function Sidebar() {
  const { user, logout } = useAuth();

  // Verifica se o usuário tem uma permissão específica
  const hasPermission = (permission?: string): boolean => {
    if (!permission) return true;
    if (!user) return false;
    const perms = ROLE_PERMISSIONS[user.role] || [];
    return perms.includes("all") || perms.includes(permission);
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar-background border-r border-sidebar-border flex flex-col">
      {/* Cabeçalho da sidebar */}
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-lg font-bold text-sidebar-primary">
          Portaria João XXIII
        </h1>
        <p className="text-xs text-sidebar-foreground mt-1">
          {user?.name} ({user?.role})
        </p>
      </div>

      {/* Links de navegação */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems
          .filter((item) => hasPermission(item.permission))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
      </nav>

      {/* Botão de logout */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
