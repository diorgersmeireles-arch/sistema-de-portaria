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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Plus, Pencil, Trash2, Search, Users } from "lucide-react"
import type { Student, StudentFormData } from "@/types"

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null)
  const [form, setForm] = useState<StudentFormData>({ nome: "", turma: "", periodo: "MANHA" })

  useEffect(() => { loadStudents() }, [])

  async function loadStudents() {
    try {
      const { data } = await api.get("/students")
      setStudents(data)
    } catch {
      toast({ title: "Erro ao carregar", description: "Não foi possível carregar a lista de alunos.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  function openCreateModal() {
    setEditingId(null)
    setForm({ nome: "", turma: "", periodo: "MANHA" })
    setIsModalOpen(true)
  }

  function openEditModal(student: Student) {
    setEditingId(student.id)
    setForm({ nome: student.nome, turma: student.turma, periodo: student.periodo })
    setIsModalOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (editingId) {
        await api.put(`/students/${editingId}`, form)
        toast({ title: "Aluno atualizado", description: `Os dados de ${form.nome} foram atualizados.`, variant: "success" })
      } else {
        await api.post("/students", form)
        toast({ title: "Aluno cadastrado", description: `${form.nome} foi cadastrado com sucesso.`, variant: "success" })
      }
      setIsModalOpen(false)
      loadStudents()
    } catch {
      toast({ title: "Erro ao salvar", description: "Verifique os dados e tente novamente.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/students/${id}`)
      toast({ title: "Aluno excluído", description: "O aluno foi removido do sistema.", variant: "success" })
      setDeleteTarget(null)
      loadStudents()
    } catch {
      toast({ title: "Erro ao excluir", description: "Não foi possível excluir o aluno.", variant: "destructive" })
    }
  }

  const filtered = students.filter(
    (s) =>
      s.nome.toLowerCase().includes(search.toLowerCase()) ||
      s.turma.toLowerCase().includes(search.toLowerCase())
  )

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
          <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
          <p className="text-muted-foreground mt-1">Cadastro de alunos da instituição</p>
        </div>
        <Button onClick={openCreateModal} className="min-h-[44px]">
          <Plus className="h-5 w-5 mr-2" /> Novo Aluno
        </Button>
      </div>

      {students.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou turma..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11"
          />
        </div>
      )}

      {students.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Users}
              title="Nenhum aluno cadastrado"
              description="Cadastre o primeiro aluno clicando no botão acima."
              actionLabel="Novo Aluno"
              onAction={openCreateModal}
            />
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState icon={Search} title="Nenhum resultado" description={`Nenhum aluno encontrado para "${search}".`} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 text-sm font-medium">Nome</th>
                    <th className="text-left p-4 text-sm font-medium">Turma</th>
                    <th className="text-left p-4 text-sm font-medium">Período</th>
                    <th className="text-left p-4 text-sm font-medium">Responsáveis</th>
                    <th className="text-right p-4 text-sm font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4 text-sm font-medium">{student.nome}</td>
                      <td className="p-4 text-sm">{student.turma}</td>
                      <td className="p-4">
                        <Badge variant={student.periodo === "MANHA" ? "default" : "secondary"}>
                          {student.periodo === "MANHA" ? "Manhã" : "Tarde"}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {student.responsaveis?.length
                          ? student.responsaveis.map((r) => r.nome).join(", ")
                          : "—"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(student)} className="h-9 w-9">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(student)}
                            className="h-9 w-9 hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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
            <DialogTitle>{editingId ? "Editar Aluno" : "Novo Aluno"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Atualize os dados do aluno." : "Preencha os dados para cadastrar um novo aluno."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: Maria Silva"
                  required
                  autoFocus
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="turma">Turma</Label>
                <Input
                  id="turma"
                  value={form.turma}
                  onChange={(e) => setForm({ ...form, turma: e.target.value })}
                  placeholder="Ex: 3º Ano A"
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="periodo">Período</Label>
                <Select
                  value={form.periodo}
                  onValueChange={(value) => setForm({ ...form, periodo: value as "MANHA" | "TARDE" })}
                >
                  <SelectTrigger id="periodo" className="h-11">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANHA">Manhã</SelectItem>
                    <SelectItem value="TARDE">Tarde</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Salvando..." : editingId ? "Atualizar" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir Aluno"
        description={`Tem certeza que deseja excluir "${deleteTarget?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Sim, Excluir"
        variant="destructive"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />
    </div>
  )
}
