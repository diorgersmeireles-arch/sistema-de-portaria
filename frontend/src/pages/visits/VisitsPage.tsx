import { useState, useEffect, type FormEvent } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Plus, Calendar, CheckCircle2, XCircle, CalendarCheck } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import type { VisitSchedule } from "@/types"

export function VisitsPage() {
  const [visits, setVisits] = useState<VisitSchedule[]>([])
  const [todayVisitCount, setTodayVisitCount] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ id: string; name: string; type: "CONCLUIDO" | "CANCELADO" } | null>(null)
  const [form, setForm] = useState({
    nomeVisitante: "",
    documento: "",
    dataHoraAgendada: "",
    setorDestino: "",
    observacoes: "",
  })

  useEffect(() => {
    Promise.all([loadVisits(), loadTodayCount()])
  }, [])

  async function loadVisits() {
    try {
      const { data } = await api.get("/visit-schedules")
      setVisits(data)
    } catch {
      toast({ title: "Erro ao carregar", description: "Não foi possível carregar os agendamentos.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  async function loadTodayCount() {
    try {
      const { data } = await api.get("/visit-schedules/today")
      setTodayVisitCount(data.length)
    } catch {
      console.error("Erro ao carregar contagem de hoje")
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    try {
      await api.post("/visit-schedules", {
        ...form,
        dataHoraAgendada: new Date(form.dataHoraAgendada).toISOString(),
        documento: form.documento || undefined,
        observacoes: form.observacoes || undefined,
      })
      setIsModalOpen(false)
      setForm({ nomeVisitante: "", documento: "", dataHoraAgendada: "", setorDestino: "", observacoes: "" })
      toast({ title: "Visita agendada", description: `Agendamento para ${form.nomeVisitante} criado com sucesso.`, variant: "success" })
      Promise.all([loadVisits(), loadTodayCount()])
    } catch {
      toast({ title: "Erro ao agendar", description: "Verifique os dados e tente novamente.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleStatusUpdate(id: string, status: string) {
    try {
      await api.put(`/visit-schedules/${id}`, { status })
      const label = status === "CONCLUIDO" ? "concluída" : "cancelada"
      toast({ title: `Visita ${label}`, description: `A visita foi ${label} com sucesso.`, variant: status === "CONCLUIDO" ? "success" : "default" })
      setConfirmAction(null)
      Promise.all([loadVisits(), loadTodayCount()])
    } catch {
      toast({ title: "Erro ao atualizar", description: "Não foi possível atualizar o status.", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamento de Visitas</h1>
          <p className="text-muted-foreground mt-1">Pré-agendamento de reuniões e visitas institucionais</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm px-3 py-1.5">
            <Calendar className="h-4 w-4 mr-1" />
            {todayVisitCount} visita{todayVisitCount !== 1 ? "s" : ""} hoje
          </Badge>
          <Button onClick={() => setIsModalOpen(true)} className="min-h-[44px]">
            <Plus className="h-5 w-5 mr-2" /> Novo Agendamento
          </Button>
        </div>
      </div>

      {visits.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={CalendarCheck}
              title="Nenhum agendamento encontrado"
              description="Crie o primeiro agendamento clicando no botão acima."
              actionLabel="Novo Agendamento"
              onAction={() => setIsModalOpen(true)}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 text-sm font-medium">Visitante</th>
                    <th className="text-left p-4 text-sm font-medium">Documento</th>
                    <th className="text-left p-4 text-sm font-medium">Data/Hora</th>
                    <th className="text-left p-4 text-sm font-medium">Setor</th>
                    <th className="text-left p-4 text-sm font-medium">Status</th>
                    <th className="text-left p-4 text-sm font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((v) => (
                    <tr key={v.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4 text-sm font-medium">{v.nomeVisitante}</td>
                      <td className="p-4 text-sm font-mono">{v.documento || "—"}</td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDateTime(v.dataHoraAgendada)}</td>
                      <td className="p-4 text-sm">{v.setorDestino}</td>
                      <td className="p-4">
                        <Badge
                          variant={
                            v.status === "CONCLUIDO" ? "success" : v.status === "CANCELADO" ? "destructive" : "default"
                          }
                        >
                          {v.status === "PENDENTE" ? "Pendente" : v.status === "CONCLUIDO" ? "Concluído" : "Cancelado"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {v.status === "PENDENTE" && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => setConfirmAction({ id: v.id, name: v.nomeVisitante, type: "CONCLUIDO" })}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" /> Concluir
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setConfirmAction({ id: v.id, name: v.nomeVisitante, type: "CANCELADO" })}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Cancelar
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription>Preencha os dados para agendar uma visita.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="nomeVisitante">Nome do visitante</Label>
                <Input id="nomeVisitante" value={form.nomeVisitante} onChange={(e) => setForm({ ...form, nomeVisitante: e.target.value })} placeholder="Ex: Carlos Alberto" required autoFocus className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documento">Documento (opcional)</Label>
                <Input id="documento" value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} placeholder="Ex: RG, CPF" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataHoraAgendada">Data e hora</Label>
                <Input id="dataHoraAgendada" type="datetime-local" value={form.dataHoraAgendada} onChange={(e) => setForm({ ...form, dataHoraAgendada: e.target.value })} required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="setorDestino">Setor de destino</Label>
                <Input id="setorDestino" value={form.setorDestino} onChange={(e) => setForm({ ...form, setorDestino: e.target.value })} placeholder="Ex: Secretaria, Coordenação" required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações (opcional)</Label>
                <Input id="observacoes" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Ex: Acompanhado por..." className="h-11" />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancelar</Button>
              <Button type="submit" disabled={isSaving}>{isSaving ? "Agendando..." : "Agendar Visita"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={confirmAction?.type === "CONCLUIDO" ? "Concluir Visita" : "Cancelar Visita"}
        description={
          confirmAction?.type === "CONCLUIDO"
            ? `Confirmar a conclusão da visita de "${confirmAction?.name}"?`
            : `Tem certeza que deseja cancelar a visita de "${confirmAction?.name}"?`
        }
        confirmLabel={confirmAction?.type === "CONCLUIDO" ? "Sim, Concluir" : "Sim, Cancelar"}
        variant={confirmAction?.type === "CONCLUIDO" ? "default" : "destructive"}
        onConfirm={() => {
          if (!confirmAction) return
          handleStatusUpdate(confirmAction.id, confirmAction.type)
        }}
      />
    </div>
  )
}
