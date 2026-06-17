import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import { getRoleLabel } from "@/lib/utils"
import {
  UserPlus,
  Key,
  Truck,
  Clock,
  ArrowRight,
  type LucideIcon,
} from "lucide-react"

interface QuickAction {
  label: string
  description: string
  icon: LucideIcon
  path: string
  color: string
}

const actions: QuickAction[] = [
  {
    label: "Registrar Visitante",
    description: "Entrada de visitante na portaria",
    icon: UserPlus,
    path: "/visitors",
    color: "from-blue-500 to-blue-600",
  },
  {
    label: "Retirar Chave",
    description: "Empréstimo de chave de sala",
    icon: Key,
    path: "/keys",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    label: "Fornecedor",
    description: "Registrar entrada de fornecedor",
    icon: Truck,
    path: "/suppliers",
    color: "from-amber-500 to-amber-600",
  },
  {
    label: "Registrar Atraso",
    description: "Aluno ou funcionário atrasado",
    icon: Clock,
    path: "/delays",
    color: "from-rose-500 to-rose-600",
  },
]

export function QuickActionsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ações Rápidas</h1>
        <p className="text-muted-foreground mt-1">
          {user?.name} — {user && getRoleLabel(user.role)}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {actions.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
          >
            <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${action.color}`} />
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`rounded-lg p-3 bg-gradient-to-br ${action.color} text-white`}>
                    <action.icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {action.label}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-2" />
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground text-center">
            Toque no card da ação que deseja realizar. As ações mais comuns do seu dia a dia estão aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
