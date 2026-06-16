// StudentsPage - CRUD de Alunos
// Lista, cria, edita e exclui alunos com vínculo a responsáveis

import { useState, useEffect, type FormEvent } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, User } from "lucide-react";
import { formatDate, getRoleLabel } from "@/lib/utils";
import type { Student, StudentFormData } from "@/types";

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StudentFormData>({ nome: "", turma: "", periodo: "MANHA" });
  const [isLoading, setIsLoading] = useState(true);

  // Carrega alunos ao montar o componente
  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      const { data } = await api.get("/students");
      setStudents(data);
    } catch (err) {
      console.error("Erro ao carregar alunos:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // Abre modal para criar ou editar
  function openCreateModal() {
    setEditingId(null);
    setForm({ nome: "", turma: "", periodo: "MANHA" });
    setIsModalOpen(true);
  }

  function openEditModal(student: Student) {
    setEditingId(student.id);
    setForm({ nome: student.nome, turma: student.turma, periodo: student.periodo });
    setIsModalOpen(true);
  }

  // Salva (cria ou atualiza) aluno
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/students/${editingId}`, form);
      } else {
        await api.post("/students", form);
      }
      setIsModalOpen(false);
      loadStudents();
    } catch (err) {
      console.error("Erro ao salvar aluno:", err);
    }
  }

  // Exclui aluno
  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este aluno?")) return;
    try {
      await api.delete(`/students/${id}`);
      loadStudents();
    } catch (err) {
      console.error("Erro ao excluir aluno:", err);
    }
  }

  if (isLoading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
          <p className="text-muted-foreground mt-1">Cadastro de alunos da instituição</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" /> Novo Aluno
        </Button>
      </div>

      {/* Lista de alunos */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium">Nome</th>
                  <th className="text-left p-3 text-sm font-medium">Turma</th>
                  <th className="text-left p-3 text-sm font-medium">Período</th>
                  <th className="text-left p-3 text-sm font-medium">Responsáveis</th>
                  <th className="text-right p-3 text-sm font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-6 text-muted-foreground">
                      Nenhum aluno cadastrado
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm">{student.nome}</td>
                      <td className="p-3 text-sm">{student.turma}</td>
                      <td className="p-3">
                        <Badge variant={student.periodo === "MANHA" ? "default" : "secondary"}>
                          {student.periodo === "MANHA" ? "Manhã" : "Tarde"}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        {student.responsaveis?.length
                          ? student.responsaveis.map((r) => r.nome).join(", ")
                          : "—"}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(student)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)}>
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

      {/* Modal de criação/edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>{editingId ? "Editar Aluno" : "Novo Aluno"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input id="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="turma">Turma</Label>
                  <Input id="turma" value={form.turma} onChange={(e) => setForm({ ...form, turma: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodo">Período</Label>
                  <select
                    id="periodo"
                    value={form.periodo}
                    onChange={(e) => setForm({ ...form, periodo: e.target.value as "MANHA" | "TARDE" })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  >
                    <option value="MANHA">Manhã</option>
                    <option value="TARDE">Tarde</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
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
