import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { getRoleLabel } from "@/lib/utils"
import {
  Users,
  UserCheck,
  Key,
  Clock,
  CalendarCheck,
  Camera,
  UserPlus,
  Truck,
  Bell,
  type LucideIcon,
} from "lucide-react"

const moduleCards = [
  { title: "Visitantes", value: "—", icon: UserPlus, description: "Registrar entrada", path: "/visitors" },
  { title: "Chaves", value: "—", icon: Key, description: "Empréstimos ativos", path: "/keys" },
  { title: "Alunos", value: "—", icon: Users, description: "Total cadastrados", path: "/students" },
  { title: "Responsáveis", value: "—", icon: UserCheck, description: "Vínculos ativos", path: "/guardians" },
  { title: "Fornecedores", value: "—", icon: Truck, description: "Cadastros ativos", path: "/suppliers" },
  { title: "Atrasos", value: "—", icon: Clock, description: "Registros hoje", path: "/delays" },
  { title: "Agendamentos", value: "—", icon: CalendarCheck, description: "Visitas hoje", path: "/visits" },
  { title: "Câmeras", value: "—", icon: Camera, description: "Monitoramento", path: "/cameras" },
  { title: "Sinaleiro", value: "—", icon: Bell, description: "Horários do sinal", path: "/bell" },
]

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo, {user?.name} — {user && getRoleLabel(user.role)}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {moduleCards.map((card) => (
          <button
            key={card.path}
            onClick={() => navigate(card.path)}
            className="group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
          >
            <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}
