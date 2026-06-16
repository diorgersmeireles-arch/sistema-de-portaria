// SuppliersPage - CRUD de Fornecedores
// Inclui alerta visual de renovação obrigatória a cada 6 meses

import { useState, useEffect, type FormEvent } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Supplier } from "@/types";

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ empresa: "", nomeRepresentante: "", documento: "" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadSuppliers(); }, []);

  async function loadSuppliers() {
    try {
      const { data } = await api.get("/suppliers");
      setSuppliers(data);
    } catch (err) {
      console.error("Erro ao carregar fornecedores:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post("/suppliers", form);
      setIsModalOpen(false);
      setForm({ empresa: "", nomeRepresentante: "", documento: "" });
      loadSuppliers();
    } catch (err) {
      console.error("Erro ao salvar fornecedor:", err);
    }
  }

  if (isLoading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
          <p className="text-muted-foreground mt-1">
            Cadastro com renovação obrigatória a cada 6 meses
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Novo Fornecedor
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium">Empresa</th>
                  <th className="text-left p-3 text-sm font-medium">Representante</th>
                  <th className="text-left p-3 text-sm font-medium">Documento</th>
                  <th className="text-left p-3 text-sm font-medium">Última Renovação</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                  <th className="text-left p-3 text-sm font-medium">Dias Restantes</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-6 text-muted-foreground">
                      Nenhum fornecedor cadastrado
                    </td>
                  </tr>
                ) : (
                  suppliers.map((s) => (
                    <tr
                      key={s.id}
                      className={`border-b hover:bg-muted/50 ${
                        s.precisaRenovar ? "bg-red-50 dark:bg-red-950/20" : ""
                      }`}
                    >
                      <td className="p-3 text-sm font-medium">{s.empresa}</td>
                      <td className="p-3 text-sm">{s.nomeRepresentante}</td>
                      <td className="p-3 text-sm font-mono">{s.documento}</td>
                      <td className="p-3 text-sm">{formatDate(s.lastRenewal)}</td>
                      <td className="p-3">
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
                      <td className="p-3 text-sm">
                        {s.precisaRenovar ? (
                          <span className="text-destructive font-medium">Vencido</span>
                        ) : (
                          <span>{s.diasRestantes} dias</span>
                        )}
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
              <CardTitle>Novo Fornecedor</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa</Label>
                  <Input id="empresa" value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nomeRepresentante">Nome do Representante</Label>
                  <Input id="nomeRepresentante" value={form.nomeRepresentante} onChange={(e) => setForm({ ...form, nomeRepresentante: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documento">Documento (CNPJ/CPF)</Label>
                  <Input id="documento" value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} required />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                  <Button type="submit">Criar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
