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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Clock, User, GraduationCap, Timer } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import type { Delay, Student } from "@/types"

export function DelaysPage() {
  const [delays, setDelays] = useState<Delay[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [type, setType] = useState<"student" | "employee">("student")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({ pessoaId: "", justificativa: "" })

  useEffect(() => {
    Promise.all([loadDelays(), loadStudents()])
  }, [])

  async function loadDelays() {
    try {
      const { data } = await api.get("/delays")
      setDelays(data)
    } catch {
      toast({ title: "Erro ao carregar", description: "Não foi possível carregar os registros de atraso.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  async function loadStudents() {
    try {
      const { data } = await api.get("/students")
      setStudents(data)
    } catch {
      toast({ title: "Erro ao carregar alunos", description: "Não foi possível carregar a lista de alunos.", variant: "destructive" })
    }
  }

  function openModal(selectedType: "student" | "employee") {
    setType(selectedType)
    setForm({ pessoaId: "", justificativa: "" })
    setIsModalOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    try {
      const endpoint = type === "student" ? "/delays/student" : "/delays/employee"
      const payload = type === "student"
        ? { studentId: form.pessoaId, justificativa: form.justificativa || undefined }
        : { userId: form.pessoaId, justificativa: form.justificativa || undefined }

      await api.post(endpoint, payload)
      setIsModalOpen(false)
      toast({
        title: "Atraso registrado",
        description: type === "student" ? "Atraso do aluno registrado com sucesso." : "Atraso do funcionário registrado com sucesso.",
        variant: "success",
      })
      loadDelays()
    } catch {
      toast({ title: "Erro ao registrar", description: "Verifique os dados e tente novamente.", variant: "destructive" })
    } finally {
      setIsSaving(false)
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
          <h1 className="text-3xl font-bold tracking-tight">Registro de Atrasos</h1>
          <p className="text-muted-foreground mt-1">Controle de entrada tardia de alunos e funcionários</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openModal("student")} className="min-h-[44px]">
            <GraduationCap className="h-5 w-5 mr-2" /> Atraso Aluno
          </Button>
          <Button variant="outline" onClick={() => openModal("employee")} className="min-h-[44px]">
            <User className="h-5 w-5 mr-2" /> Atraso Funcionário
          </Button>
        </div>
      </div>

      {delays.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Timer}
              title="Nenhum atraso registrado"
              description="Os registros de atraso aparecerão aqui."
              actionLabel="Registrar Atraso"
              onAction={() => openModal("student")}
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
                    <th className="text-left p-4 text-sm font-medium">Tipo</th>
                    <th className="text-left p-4 text-sm font-medium">Nome</th>
                    <th className="text-left p-4 text-sm font-medium">Horário</th>
                    <th className="text-left p-4 text-sm font-medium">Justificativa</th>
                  </tr>
                </thead>
                <tbody>
                  {delays.map((delay) => (
                    <tr key={delay.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <Badge variant={delay.student ? "default" : "secondary"}>
                          {delay.student ? "Aluno" : "Funcionário"}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm font-medium">
                        {delay.student?.nome || delay.user?.name || "—"}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDateTime(delay.horarioAtraso)}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {delay.justificativa || "—"}
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
            <DialogTitle>Registrar Atraso — {type === "student" ? "Aluno" : "Funcionário"}</DialogTitle>
            <DialogDescription>
              Preencha os dados para registrar o atraso.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="pessoaId">
                  {type === "student" ? "Aluno" : "ID do Funcionário"}
                </Label>
                {type === "student" ? (
                  <Select
                    value={form.pessoaId}
                    onValueChange={(value) => setForm({ ...form, pessoaId: value })}
                  >
                    <SelectTrigger id="pessoaId" className="h-11">
                      <SelectValue placeholder="Selecione um aluno..." />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.nome} — {s.turma}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="pessoaId"
                    value={form.pessoaId}
                    onChange={(e) => setForm({ ...form, pessoaId: e.target.value })}
                    placeholder="ID do funcionário"
                    required
                    className="h-11"
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
                  className="h-11"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Registrando..." : "Registrar Atraso"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
