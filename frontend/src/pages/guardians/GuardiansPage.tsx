import { useState, useEffect, type FormEvent } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
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
import { Plus, Pencil, Trash2, Search, UserCheck } from "lucide-react"
import type { Guardian, GuardianFormData } from "@/types"

export function GuardiansPage() {
  const [guardians, setGuardians] = useState<Guardian[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Guardian | null>(null)
  const [form, setForm] = useState<GuardianFormData>({ nome: "", documento: "", contato: "" })

  useEffect(() => { loadGuardians() }, [])

  async function loadGuardians() {
    try {
      const { data } = await api.get("/guardians")
      setGuardians(data)
    } catch {
      toast({ title: "Erro ao carregar", description: "Não foi possível carregar a lista de responsáveis.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  function openCreateModal() {
    setEditingId(null)
    setForm({ nome: "", documento: "", contato: "" })
    setIsModalOpen(true)
  }

  function openEditModal(guardian: Guardian) {
    setEditingId(guardian.id)
    setForm({ nome: guardian.nome, documento: guardian.documento, contato: guardian.contato })
    setIsModalOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (editingId) {
        await api.put(`/guardians/${editingId}`, form)
        toast({ title: "Responsável atualizado", description: `Os dados de ${form.nome} foram atualizados.`, variant: "success" })
      } else {
        await api.post("/guardians", form)
        toast({ title: "Responsável cadastrado", description: `${form.nome} foi cadastrado com sucesso.`, variant: "success" })
      }
      setIsModalOpen(false)
      loadGuardians()
    } catch {
      toast({ title: "Erro ao salvar", description: "Verifique os dados e tente novamente.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/guardians/${id}`)
      toast({ title: "Responsável excluído", description: "O responsável foi removido do sistema.", variant: "success" })
      setDeleteTarget(null)
      loadGuardians()
    } catch {
      toast({ title: "Erro ao excluir", description: "Não foi possível excluir o responsável.", variant: "destructive" })
    }
  }

  const filtered = guardians.filter(
    (g) =>
      g.nome.toLowerCase().includes(search.toLowerCase()) ||
      g.documento.toLowerCase().includes(search.toLowerCase()) ||
      g.contato.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-3xl font-bold tracking-tight">Responsáveis</h1>
          <p className="text-muted-foreground mt-1">Cadastro de pais e responsáveis</p>
        </div>
        <Button onClick={openCreateModal} className="min-h-[44px]">
          <Plus className="h-5 w-5 mr-2" /> Novo Responsável
        </Button>
      </div>

      {guardians.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, documento ou contato..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11"
          />
        </div>
      )}

      {guardians.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={UserCheck}
              title="Nenhum responsável cadastrado"
              description="Cadastre o primeiro responsável clicando no botão acima."
              actionLabel="Novo Responsável"
              onAction={openCreateModal}
            />
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState icon={Search} title="Nenhum resultado" description={`Nenhum responsável encontrado para "${search}".`} />
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
                    <th className="text-left p-4 text-sm font-medium">Documento</th>
                    <th className="text-left p-4 text-sm font-medium">Contato</th>
                    <th className="text-left p-4 text-sm font-medium">Alunos Vinculados</th>
                    <th className="text-right p-4 text-sm font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((guardian) => (
                    <tr key={guardian.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4 text-sm font-medium">{guardian.nome}</td>
                      <td className="p-4 text-sm font-mono">{guardian.documento}</td>
                      <td className="p-4 text-sm">{guardian.contato}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {guardian.alunosVinculados?.length
                          ? guardian.alunosVinculados.map((a) => a.nome).join(", ")
                          : "—"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(guardian)} className="h-9 w-9">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(guardian)}
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
            <DialogTitle>{editingId ? "Editar Responsável" : "Novo Responsável"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Atualize os dados do responsável." : "Preencha os dados para cadastrar um novo responsável."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input id="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: João Santos" required autoFocus className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documento">Documento (CPF/RG)</Label>
                <Input id="documento" value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} placeholder="Ex: 123.456.789-00" required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contato">Contato (telefone)</Label>
                <Input id="contato" value={form.contato} onChange={(e) => setForm({ ...form, contato: e.target.value })} placeholder="Ex: (11) 99999-9999" required className="h-11" />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancelar</Button>
              <Button type="submit" disabled={isSaving}>{isSaving ? "Salvando..." : editingId ? "Atualizar" : "Cadastrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir Responsável"
        description={`Tem certeza que deseja excluir "${deleteTarget?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Sim, Excluir"
        variant="destructive"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />
    </div>
  )
}
