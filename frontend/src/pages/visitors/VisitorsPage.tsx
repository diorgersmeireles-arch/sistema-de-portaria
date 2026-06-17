import { useState, useEffect, type FormEvent } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Plus, UserPlus, Search } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import type { Visitor } from "@/types"

export function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [form, setForm] = useState({ nome: "", documento: "", empresaMotivo: "" })

  useEffect(() => { loadVisitors() }, [])

  async function loadVisitors() {
    try {
      const { data } = await api.get("/visitors")
      setVisitors(data)
    } catch {
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar a lista de visitantes.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    try {
      await api.post("/visitors", form)
      setIsModalOpen(false)
      setForm({ nome: "", documento: "", empresaMotivo: "" })
      toast({
        title: "Visitante registrado",
        description: `${form.nome} foi registrado com sucesso.`,
        variant: "success",
      })
      loadVisitors()
    } catch {
      toast({
        title: "Erro ao salvar",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const filtered = visitors.filter(
    (v) =>
      v.nome.toLowerCase().includes(search.toLowerCase()) ||
      (v.documento && v.documento.includes(search)) ||
      v.empresaMotivo.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-3xl font-bold tracking-tight">Visitantes</h1>
          <p className="text-muted-foreground mt-1">Registro de entrada de visitantes na portaria</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="min-h-[44px]">
          <Plus className="h-5 w-5 mr-2" /> Novo Visitante
        </Button>
      </div>

      {visitors.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, documento ou motivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11"
          />
        </div>
      )}

      {visitors.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={UserPlus}
              title="Nenhum visitante registrado"
              description="Registre a entrada do primeiro visitante clicando no botão acima."
              actionLabel="Registrar Visitante"
              onAction={() => setIsModalOpen(true)}
            />
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Search}
              title="Nenhum resultado"
              description={`Nenhum visitante encontrado para "${search}".`}
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
                    <th className="text-left p-4 text-sm font-medium">Nome</th>
                    <th className="text-left p-4 text-sm font-medium">Documento</th>
                    <th className="text-left p-4 text-sm font-medium">Empresa / Motivo</th>
                    <th className="text-left p-4 text-sm font-medium">Entrada</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => (
                    <tr key={v.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4 text-sm font-medium">{v.nome}</td>
                      <td className="p-4 text-sm font-mono">{v.documento || "—"}</td>
                      <td className="p-4 text-sm">{v.empresaMotivo}</td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDateTime(v.dataEntrada)}</td>
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
            <DialogTitle>Novo Visitante</DialogTitle>
            <DialogDescription>
              Preencha os dados para registrar a entrada do visitante.
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
                  placeholder="Ex: João Silva"
                  required
                  autoFocus
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documento">Documento (opcional)</Label>
                <Input
                  id="documento"
                  value={form.documento}
                  onChange={(e) => setForm({ ...form, documento: e.target.value })}
                  placeholder="Ex: RG, CPF"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="empresaMotivo">Empresa / Motivo da visita</Label>
                <Input
                  id="empresaMotivo"
                  value={form.empresaMotivo}
                  onChange={(e) => setForm({ ...form, empresaMotivo: e.target.value })}
                  placeholder="Ex: Entrega de materiais"
                  required
                  className="h-11"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Registrando..." : "Registrar Entrada"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
