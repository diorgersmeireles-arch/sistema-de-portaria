// KeysPage - Sistema de Empréstimo de Chaves
// Painel com retirada, devolução e histórico de chaves

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KeyIcon, ArrowRightLeft, History, RotateCcw } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { KeyItem, KeyLog } from "@/types";

export function KeysPage() {
  const [keys, setKeys] = useState<KeyItem[]>([]);
  const [logs, setLogs] = useState<KeyLog[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [keysRes, logsRes] = await Promise.all([
        api.get("/keys"),
        api.get("/keys/logs/history"),
      ]);
      setKeys(keysRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // Retirada de chave
  async function handleBorrow(keyId: string) {
    try {
      await api.post(`/keys/${keyId}/borrow`);
      loadData();
    } catch (err) {
      console.error("Erro ao retirar chave:", err);
    }
  }

  // Devolução de chave
  async function handleReturn(keyId: string) {
    try {
      await api.post(`/keys/${keyId}/return`);
      loadData();
    } catch (err) {
      console.error("Erro ao devolver chave:", err);
    }
  }

  if (isLoading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empréstimo de Chaves</h1>
          <p className="text-muted-foreground mt-1">Retirada e devolução de chaves de salas e setores</p>
        </div>
        <Button variant="outline" onClick={() => setShowHistory(!showHistory)}>
          <History className="h-4 w-4 mr-2" />
          {showHistory ? "Painel de Chaves" : "Histórico"}
        </Button>
      </div>

      {showHistory ? (
        /* Histórico de movimentações */
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Movimentações</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 text-sm font-medium">Chave</th>
                    <th className="text-left p-3 text-sm font-medium">Usuário</th>
                    <th className="text-left p-3 text-sm font-medium">Retirada</th>
                    <th className="text-left p-3 text-sm font-medium">Devolução</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm">{log.key?.salaSetor} ({log.key?.codigoChave})</td>
                      <td className="p-3 text-sm">{log.user?.name}</td>
                      <td className="p-3 text-sm">{formatDateTime(log.borrowedAt)}</td>
                      <td className="p-3 text-sm">{log.returnedAt ? formatDateTime(log.returnedAt) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Grid de chaves */
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
                  <Badge variant={key.status === "DISPONIVEL" ? "success" : "warning"}>
                    {key.status === "DISPONIVEL" ? "Disponível" : "Emprestada"}
                  </Badge>
                  {key.usuarioAtual && (
                    <span className="text-xs text-muted-foreground">
                      com {key.usuarioAtual.name}
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  {key.status === "DISPONIVEL" ? (
                    <Button size="sm" className="w-full" onClick={() => handleBorrow(key.id)}>
                      <ArrowRightLeft className="h-4 w-4 mr-2" /> Retirar
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="w-full" onClick={() => handleReturn(key.id)}>
                      <RotateCcw className="h-4 w-4 mr-2" /> Devolver
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
