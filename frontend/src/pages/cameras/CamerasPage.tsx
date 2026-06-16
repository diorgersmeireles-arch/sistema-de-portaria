// CamerasPage - Dashboard de Câmeras IP
// Visualização em grid responsivo das câmeras de segurança

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, CameraOff } from "lucide-react";
import type { Camera as CameraType } from "@/types";

export function CamerasPage() {
  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCameras();
  }, []);

  async function loadCameras() {
    try {
      const { data } = await api.get("/cameras");
      setCameras(data);
    } catch (err) {
      console.error("Erro ao carregar câmeras:", err);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Câmeras IP</h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento em tempo real das câmeras da instituição
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          <Camera className="h-4 w-4 mr-1" />
          {cameras.filter((c) => c.ativa).length} ativa(s)
        </Badge>
      </div>

      {/* Grid de câmeras */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cameras.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Nenhuma câmera configurada
          </div>
        ) : (
          cameras.map((camera) => (
            <Card key={camera.id} className={!camera.ativa ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{camera.nome}</CardTitle>
                  {camera.ativa ? (
                    <Camera className="h-4 w-4 text-green-500" />
                  ) : (
                    <CameraOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{camera.localizacao}</p>
              </CardHeader>
              <CardContent>
                {/* Player de vídeo mock */}
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-2">
                  {camera.ativa ? (
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">
                        {camera.nome}
                      </p>
                      {/* Em produção, usar um componente de vídeo real:
                          <img src={camera.url} alt={camera.nome} /> */}
                    </div>
                  ) : (
                    <div className="text-center">
                      <CameraOff className="h-8 w-8 text-muted-foreground mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Câmera inativa</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{camera.tipo}</span>
                  <Badge variant={camera.ativa ? "success" : "secondary"}>
                    {camera.ativa ? "Online" : "Offline"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
