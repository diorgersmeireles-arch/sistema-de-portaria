// DelaysPage - Sistema de Registro de Atrasos
// Controle de entrada tardia de alunos e funcionários com emissão de comprovante

import { useState, useEffect, type FormEvent } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, GraduationCap } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { Delay, Student } from "@/types";

export function DelaysPage() {
  const [delays, setDelays] = useState<Delay[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState<"student" | "employee">("student");
  const [form, setForm] = useState({ pessoaId: "", justificativa: "" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadDelays(), loadStudents()]);
  }, []);

  async function loadDelays() {
    try {
      const { data } = await api.get("/delays");
      setDelays(data);
    } catch (err) {
      console.error("Erro ao carregar atrasos:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadStudents() {
    try {
      const { data } = await api.get("/students");
      setStudents(data);
    } catch (err) {
      console.error("Erro ao carregar alunos:", err);
    }
  }

  function openModal(selectedType: "student" | "employee") {
    setType(selectedType);
    setForm({ pessoaId: "", justificativa: "" });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const endpoint = type === "student" ? "/delays/student" : "/delays/employee";
      const payload = type === "student"
        ? { studentId: form.pessoaId, justificativa: form.justificativa || undefined }
        : { userId: form.pessoaId, justificativa: form.justificativa || undefined };

      await api.post(endpoint, payload);
      setIsModalOpen(false);
      loadDelays();
    } catch (err) {
      console.error("Erro ao registrar atraso:", err);
    }
  }

  if (isLoading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registro de Atrasos</h1>
          <p className="text-muted-foreground mt-1">Controle de entrada tardia de alunos e funcionários</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openModal("student")}>
            <GraduationCap className="h-4 w-4 mr-2" /> Atraso Aluno
          </Button>
          <Button variant="outline" onClick={() => openModal("employee")}>
            <User className="h-4 w-4 mr-2" /> Atraso Funcionário
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium">Tipo</th>
                  <th className="text-left p-3 text-sm font-medium">Nome</th>
                  <th className="text-left p-3 text-sm font-medium">Horário</th>
                  <th className="text-left p-3 text-sm font-medium">Justificativa</th>
                </tr>
              </thead>
              <tbody>
                {delays.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-6 text-muted-foreground">Nenhum atraso registrado</td>
                  </tr>
                ) : (
                  delays.map((delay) => (
                    <tr key={delay.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <Badge variant={delay.student ? "default" : "secondary"}>
                          {delay.student ? "Aluno" : "Funcionário"}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        {delay.student?.nome || delay.user?.name || "—"}
                      </td>
                      <td className="p-3 text-sm">{formatDateTime(delay.horarioAtraso)}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {delay.justificativa || "—"}
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
              <CardTitle>
                Registrar Atraso - {type === "student" ? "Aluno" : "Funcionário"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pessoaId">
                    {type === "student" ? "Aluno" : "ID do Funcionário"}
                  </Label>
                  {type === "student" ? (
                    <select
                      id="pessoaId"
                      value={form.pessoaId}
                      onChange={(e) => setForm({ ...form, pessoaId: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                      required
                    >
                      <option value="">Selecione um aluno...</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nome} - {s.turma}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id="pessoaId"
                      value={form.pessoaId}
                      onChange={(e) => setForm({ ...form, pessoaId: e.target.value })}
                      placeholder="ID do funcionário"
                      required
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="justificativa">Justificativa (opcional)</Label>
                  <Input
                    id="justificativa"
                    value={form.justificativa}
                    onChange={(e) => setForm({ ...form, justificativa: e.target.value })}
                    placeholder="Motivo do atraso"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                  <Button type="submit">Registrar Atraso</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
