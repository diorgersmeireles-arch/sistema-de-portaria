// GuardiansPage - CRUD de Responsáveis
// Gerencia cadastro de pais/responsáveis com vínculo a alunos

import { useState, useEffect, type FormEvent } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Guardian, GuardianFormData } from "@/types";

export function GuardiansPage() {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GuardianFormData>({ nome: "", documento: "", contato: "" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadGuardians(); }, []);

  async function loadGuardians() {
    try {
      const { data } = await api.get("/guardians");
      setGuardians(data);
    } catch (err) {
      console.error("Erro ao carregar responsáveis:", err);
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateModal() {
    setEditingId(null);
    setForm({ nome: "", documento: "", contato: "" });
    setIsModalOpen(true);
  }

  function openEditModal(guardian: Guardian) {
    setEditingId(guardian.id);
    setForm({ nome: guardian.nome, documento: guardian.documento, contato: guardian.contato });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/guardians/${editingId}`, form);
      } else {
        await api.post("/guardians", form);
      }
      setIsModalOpen(false);
      loadGuardians();
    } catch (err) {
      console.error("Erro ao salvar responsável:", err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este responsável?")) return;
    try {
      await api.delete(`/guardians/${id}`);
      loadGuardians();
    } catch (err) {
      console.error("Erro ao excluir responsável:", err);
    }
  }

  if (isLoading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Responsáveis</h1>
          <p className="text-muted-foreground mt-1">Cadastro de pais e responsáveis</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" /> Novo Responsável
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
                  <th className="text-left p-3 text-sm font-medium">Contato</th>
                  <th className="text-left p-3 text-sm font-medium">Alunos Vinculados</th>
                  <th className="text-right p-3 text-sm font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {guardians.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-6 text-muted-foreground">Nenhum responsável cadastrado</td>
                  </tr>
                ) : (
                  guardians.map((guardian) => (
                    <tr key={guardian.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm">{guardian.nome}</td>
                      <td className="p-3 text-sm font-mono">{guardian.documento}</td>
                      <td className="p-3 text-sm">{guardian.contato}</td>
                      <td className="p-3 text-sm">
                        {guardian.alunosVinculados?.length
                          ? guardian.alunosVinculados.map((a) => a.nome).join(", ")
                          : "—"}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(guardian)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(guardian.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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
              <CardTitle>{editingId ? "Editar Responsável" : "Novo Responsável"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input id="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documento">Documento (CPF/RG)</Label>
                  <Input id="documento" value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contato">Contato (telefone)</Label>
                  <Input id="contato" value={form.contato} onChange={(e) => setForm({ ...form, contato: e.target.value })} required />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                  <Button type="submit">{editingId ? "Atualizar" : "Criar"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
