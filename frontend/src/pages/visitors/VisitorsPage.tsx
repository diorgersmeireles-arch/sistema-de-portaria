// VisitorsPage - CRUD de Visitantes
// Gerencia registro de visitantes na portaria

import { useState, useEffect, type FormEvent } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { Visitor } from "@/types";

export function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", documento: "", empresaMotivo: "" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadVisitors(); }, []);

  async function loadVisitors() {
    try {
      const { data } = await api.get("/visitors");
      setVisitors(data);
    } catch (err) {
      console.error("Erro ao carregar visitantes:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post("/visitors", form);
      setIsModalOpen(false);
      setForm({ nome: "", documento: "", empresaMotivo: "" });
      loadVisitors();
    } catch (err) {
      console.error("Erro ao salvar visitante:", err);
    }
  }

  if (isLoading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visitantes</h1>
          <p className="text-muted-foreground mt-1">Registro de entrada de visitantes</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Novo Visitante
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium">Nome</th>
                  <th className="text-left p-3 text-sm font-medium">Documento</th>
                  <th className="text-left p-3 text-sm font-medium">Empresa / Motivo</th>
                  <th className="text-left p-3 text-sm font-medium">Entrada</th>
                </tr>
              </thead>
              <tbody>
                {visitors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-6 text-muted-foreground">Nenhum visitante registrado</td>
                  </tr>
                ) : (
                  visitors.map((v) => (
                    <tr key={v.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm">{v.nome}</td>
                      <td className="p-3 text-sm font-mono">{v.documento || "—"}</td>
                      <td className="p-3 text-sm">{v.empresaMotivo}</td>
                      <td className="p-3 text-sm">{formatDateTime(v.dataEntrada)}</td>
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
              <CardTitle>Novo Visitante</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input id="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documento">Documento (opcional)</Label>
                  <Input id="documento" value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresaMotivo">Empresa / Motivo da visita</Label>
                  <Input id="empresaMotivo" value={form.empresaMotivo} onChange={(e) => setForm({ ...form, empresaMotivo: e.target.value })} required />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                  <Button type="submit">Registrar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
