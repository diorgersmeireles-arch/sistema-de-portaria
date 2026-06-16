// Dashboard - Página inicial com resumo do sistema

import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getRoleLabel } from "@/lib/utils";
import { Users, UserCheck, Key, Clock, CalendarCheck, Camera } from "lucide-react";

// Cards de resumo estáticos (dados viriam do backend em produção)
const summaryCards = [
  { title: "Alunos", value: "—", icon: Users, description: "Total de alunos cadastrados" },
  { title: "Visitantes", value: "—", icon: UserCheck, description: "Visitantes hoje" },
  { title: "Chaves", value: "—", icon: Key, description: "Chaves emprestadas" },
  { title: "Atrasos", value: "—", icon: Clock, description: "Registros hoje" },
  { title: "Agendamentos", value: "—", icon: CalendarCheck, description: "Visitas agendadas hoje" },
  { title: "Câmeras", value: "—", icon: Camera, description: "Câmeras ativas" },
];

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo, {user?.name} — {user && getRoleLabel(user.role)}
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Módulos do sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Módulos do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Cadastro de Alunos", desc: "Gerenciar alunos e turmas" },
              { name: "Cadastro de Responsáveis", desc: "Vincular pais e alunos" },
              { name: "Visitantes", desc: "Registro de entrada de visitantes" },
              { name: "Fornecedores", desc: "Controle com renovação semestral" },
              { name: "Empréstimo de Chaves", desc: "Retirada e devolução de chaves" },
              { name: "Registro de Atrasos", desc: "Controle de entrada tardia" },
              { name: "Agendamento de Visitas", desc: "Pré-agendamento e validação" },
              { name: "Câmeras IP", desc: "Monitoramento em tempo real" },
              { name: "Sinaleiro", desc: "Horários das batidas do sinal" },
            ].map((mod) => (
              <div key={mod.name} className="p-3 rounded-lg border bg-card">
                <h3 className="font-medium text-sm">{mod.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{mod.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
