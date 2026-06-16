// VisitsPage - Sistema de Agendamento de Visitas
// Calendário de pré-agendamento com validação rápida na portaria

import { useState, useEffect, type FormEvent } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { VisitSchedule } from "@/types";

export function VisitsPage() {
  const [visits, setVisits] = useState<VisitSchedule[]>([]);
  const [todayVisitCount, setTodayVisitCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    nomeVisitante: "",
    documento: "",
    dataHoraAgendada: "",
    setorDestino: "",
    observacoes: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadVisits(), loadTodayCount()]);
  }, []);

  async function loadVisits() {
    try {
      const { data } = await api.get("/visit-schedules");
      setVisits(data);
    } catch (err) {
      console.error("Erro ao carregar agendamentos:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadTodayCount() {
    try {
      const { data } = await api.get("/visit-schedules/today");
      setTodayVisitCount(data.length);
    } catch (err) {
      console.error("Erro ao carregar agendamentos de hoje:", err);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post("/visit-schedules", {
        ...form,
        dataHoraAgendada: new Date(form.dataHoraAgendada).toISOString(),
        documento: form.documento || undefined,
        observacoes: form.observacoes || undefined,
      });
      setIsModalOpen(false);
      setForm({ nomeVisitante: "", documento: "", dataHoraAgendada: "", setorDestino: "", observacoes: "" });
      Promise.all([loadVisits(), loadTodayCount()]);
    } catch (err) {
      console.error("Erro ao criar agendamento:", err);
    }
  }

  async function handleStatusUpdate(id: string, status: string) {
    try {
      await api.put(`/visit-schedules/${id}`, { status });
      Promise.all([loadVisits(), loadTodayCount()]);
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  }

  if (isLoading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamento de Visitas</h1>
          <p className="text-muted-foreground mt-1">
            Pré-agendamento de reuniões e visitas institucionais
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm px-3 py-1">
            <Calendar className="h-4 w-4 mr-1" />
            {todayVisitCount} visita{todayVisitCount !== 1 ? "s" : ""} hoje
          </Badge>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo Agendamento
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium">Visitante</th>
                  <th className="text-left p-3 text-sm font-medium">Documento</th>
                  <th className="text-left p-3 text-sm font-medium">Data/Hora</th>
                  <th className="text-left p-3 text-sm font-medium">Setor</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                  <th className="text-left p-3 text-sm font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {visits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-6 text-muted-foreground">
                      Nenhum agendamento encontrado
                    </td>
                  </tr>
                ) : (
                  visits.map((v) => (
                    <tr key={v.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm font-medium">{v.nomeVisitante}</td>
                      <td className="p-3 text-sm font-mono">{v.documento || "—"}</td>
                      <td className="p-3 text-sm">{formatDateTime(v.dataHoraAgendada)}</td>
                      <td className="p-3 text-sm">{v.setorDestino}</td>
                      <td className="p-3">
                        <Badge
                          variant={
                            v.status === "CONCLUIDO"
                              ? "success"
                              : v.status === "CANCELADO"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {v.status === "PENDENTE" ? "Pendente" : v.status === "CONCLUIDO" ? "Concluído" : "Cancelado"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {v.status === "PENDENTE" && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(v.id, "CONCLUIDO")}>
                              Concluir
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleStatusUpdate(v.id, "CANCELADO")}>
                              Cancelar
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Novo Agendamento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeVisitante">Nome do visitante</Label>
                  <Input id="nomeVisitante" value={form.nomeVisitante} onChange={(e) => setForm({ ...form, nomeVisitante: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documento">Documento (opcional)</Label>
                  <Input id="documento" value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataHoraAgendada">Data e hora</Label>
                  <Input id="dataHoraAgendada" type="datetime-local" value={form.dataHoraAgendada} onChange={(e) => setForm({ ...form, dataHoraAgendada: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setorDestino">Setor de destino</Label>
                  <Input id="setorDestino" value={form.setorDestino} onChange={(e) => setForm({ ...form, setorDestino: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações (opcional)</Label>
                  <Input id="observacoes" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                  <Button type="submit">Agendar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
