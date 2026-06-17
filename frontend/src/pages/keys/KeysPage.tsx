import { useState, useEffect } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/hooks/use-toast"
import { KeyIcon, ArrowRightLeft, History, RotateCcw, KeyRound } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import type { KeyItem, KeyLog } from "@/types"

export function KeysPage() {
  const [keys, setKeys] = useState<KeyItem[]>([])
  const [logs, setLogs] = useState<KeyLog[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [confirmAction, setConfirmAction] = useState<{
    keyId: string
    type: "borrow" | "return"
    label: string
  } | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [keysRes, logsRes] = await Promise.all([
        api.get("/keys"),
        api.get("/keys/logs/history"),
      ])
      setKeys(keysRes.data)
      setLogs(logsRes.data)
    } catch {
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar os dados das chaves.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleBorrow(keyId: string) {
    try {
      await api.post(`/keys/${keyId}/borrow`)
      toast({
        title: "Chave retirada",
        description: "A chave foi registrada como emprestada.",
        variant: "success",
      })
      loadData()
    } catch {
      toast({
        title: "Erro ao retirar chave",
        description: "Tente novamente ou contate o suporte.",
        variant: "destructive",
      })
    } finally {
      setConfirmAction(null)
    }
  }

  async function handleReturn(keyId: string) {
    try {
      await api.post(`/keys/${keyId}/return`)
      toast({
        title: "Chave devolvida",
        description: "A chave foi registrada como disponível.",
        variant: "success",
      })
      loadData()
    } catch {
      toast({
        title: "Erro ao devolver chave",
        description: "Tente novamente ou contate o suporte.",
        variant: "destructive",
      })
    } finally {
      setConfirmAction(null)
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
          <h1 className="text-3xl font-bold tracking-tight">Empréstimo de Chaves</h1>
          <p className="text-muted-foreground mt-1">Retirada e devolução de chaves de salas e setores</p>
        </div>
        <Button variant="outline" onClick={() => setShowHistory(!showHistory)} className="min-h-[44px]">
          <History className="h-5 w-5 mr-2" />
          {showHistory ? "Painel de Chaves" : "Histórico"}
        </Button>
      </div>

      {showHistory ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Movimentações</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {logs.length === 0 ? (
              <EmptyState
                icon={History}
                title="Nenhuma movimentação"
                description="O histórico será preenchido conforme as chaves forem retiradas e devolvidas."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 text-sm font-medium">Chave</th>
                      <th className="text-left p-4 text-sm font-medium">Usuário</th>
                      <th className="text-left p-4 text-sm font-medium">Retirada</th>
                      <th className="text-left p-4 text-sm font-medium">Devolução</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4 text-sm">
                          {log.key?.salaSetor}{" "}
                          <span className="text-muted-foreground font-mono">({log.key?.codigoChave})</span>
                        </td>
                        <td className="p-4 text-sm">{log.user?.name}</td>
                        <td className="p-4 text-sm text-muted-foreground">{formatDateTime(log.borrowedAt)}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {log.returnedAt ? formatDateTime(log.returnedAt) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : keys.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={KeyRound}
              title="Nenhuma chave cadastrada"
              description="As chaves aparecerão aqui após serem cadastradas no sistema."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {keys.map((key) => (
            <Card key={key.id} className={key.status === "EMPRESTADA" ? "border-yellow-300" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{key.salaSetor}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {key.codigoChave}
                    </p>
                  </div>
                  <KeyIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge
                    variant={key.status === "DISPONIVEL" ? "success" : "warning"}
                    className="text-xs px-3 py-1"
                  >
                    {key.status === "DISPONIVEL" ? "Disponível" : "Emprestada"}
                  </Badge>
                  {key.usuarioAtual && (
                    <span className="text-xs text-muted-foreground">
                      com {key.usuarioAtual.name}
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  {key.status === "DISPONIVEL" ? (
                    <Button
                      size="lg"
                      className="w-full min-h-[44px]"
                      onClick={() =>
                        setConfirmAction({ keyId: key.id, type: "borrow", label: key.salaSetor })
                      }
                    >
                      <ArrowRightLeft className="h-5 w-5 mr-2" /> Retirar
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full min-h-[44px]"
                      onClick={() =>
                        setConfirmAction({ keyId: key.id, type: "return", label: key.salaSetor })
                      }
                    >
                      <RotateCcw className="h-5 w-5 mr-2" /> Devolver
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={confirmAction?.type === "borrow" ? "Retirar Chave" : "Devolver Chave"}
        description={
          confirmAction?.type === "borrow"
            ? `Confirmar a retirada da chave "${confirmAction?.label}"?`
            : `Confirmar a devolução da chave "${confirmAction?.label}"?`
        }
        confirmLabel={confirmAction?.type === "borrow" ? "Sim, Retirar" : "Sim, Devolver"}
        variant={confirmAction?.type === "borrow" ? "default" : "default"}
        onConfirm={() => {
          if (!confirmAction) return
          if (confirmAction.type === "borrow") handleBorrow(confirmAction.keyId)
          else handleReturn(confirmAction.keyId)
        }}
      />
    </div>
  )
}
