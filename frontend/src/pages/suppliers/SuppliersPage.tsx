import { useState, useEffect, type FormEvent } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Plus, AlertTriangle, CheckCircle2, Search, Truck } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Supplier } from "@/types"

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [form, setForm] = useState({ empresa: "", nomeRepresentante: "", documento: "" })

  useEffect(() => { loadSuppliers() }, [])

  async function loadSuppliers() {
    try {
      const { data } = await api.get("/suppliers")
      setSuppliers(data)
    } catch {
      toast({ title: "Erro ao carregar", description: "Não foi possível carregar a lista de fornecedores.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    try {
      await api.post("/suppliers", form)
      setIsModalOpen(false)
      setForm({ empresa: "", nomeRepresentante: "", documento: "" })
      toast({ title: "Fornecedor cadastrado", description: `${form.empresa} foi cadastrado com sucesso.`, variant: "success" })
      loadSuppliers()
    } catch {
      toast({ title: "Erro ao salvar", description: "Verifique os dados e tente novamente.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const filtered = suppliers.filter(
    (s) =>
      s.empresa.toLowerCase().includes(search.toLowerCase()) ||
      s.nomeRepresentante.toLowerCase().includes(search.toLowerCase()) ||
      s.documento.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
          <p className="text-muted-foreground mt-1">Cadastro com renovação obrigatória a cada 6 meses</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="min-h-[44px]">
          <Plus className="h-5 w-5 mr-2" /> Novo Fornecedor
        </Button>
      </div>

      {suppliers.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por empresa, representante ou documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11"
          />
        </div>
      )}

      {suppliers.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Truck}
              title="Nenhum fornecedor cadastrado"
              description="Cadastre o primeiro fornecedor clicando no botão acima."
              actionLabel="Novo Fornecedor"
              onAction={() => setIsModalOpen(true)}
            />
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState icon={Search} title="Nenhum resultado" description={`Nenhum fornecedor encontrado para "${search}".`} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 text-sm font-medium">Empresa</th>
                    <th className="text-left p-4 text-sm font-medium">Representante</th>
                    <th className="text-left p-4 text-sm font-medium">Documento</th>
                    <th className="text-left p-4 text-sm font-medium">Última Renovação</th>
                    <th className="text-left p-4 text-sm font-medium">Status</th>
                    <th className="text-left p-4 text-sm font-medium">Dias Restantes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr
                      key={s.id}
                      className={`border-b hover:bg-muted/50 transition-colors ${
                        s.precisaRenovar ? "bg-red-50 dark:bg-red-950/20" : ""
                      }`}
                    >
                      <td className="p-4 text-sm font-medium">{s.empresa}</td>
                      <td className="p-4 text-sm">{s.nomeRepresentante}</td>
                      <td className="p-4 text-sm font-mono">{s.documento}</td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDate(s.lastRenewal)}</td>
                      <td className="p-4">
                        {s.precisaRenovar ? (
                          <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                            <AlertTriangle className="h-3 w-3" />
                            Bloqueado
                          </Badge>
                        ) : (
                          <Badge variant="success" className="flex items-center gap-1 w-fit">
                            <CheckCircle2 className="h-3 w-3" />
                            Ativo
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-sm">
                        {s.precisaRenovar ? (
                          <span className="text-destructive font-medium">Vencido</span>
                        ) : (
                          <span>{s.diasRestantes} dias</span>
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
            <DialogTitle>Novo Fornecedor</DialogTitle>
            <DialogDescription>Preencha os dados para cadastrar um novo fornecedor.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Input id="empresa" value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} placeholder="Nome da empresa" required autoFocus className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomeRepresentante">Nome do Representante</Label>
                <Input id="nomeRepresentante" value={form.nomeRepresentante} onChange={(e) => setForm({ ...form, nomeRepresentante: e.target.value })} placeholder="Nome completo" required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documento">Documento (CNPJ/CPF)</Label>
                <Input id="documento" value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} placeholder="Ex: 00.000.000/0001-00" required className="h-11" />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancelar</Button>
              <Button type="submit" disabled={isSaving}>{isSaving ? "Salvando..." : "Cadastrar Fornecedor"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
