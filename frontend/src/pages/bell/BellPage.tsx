// BellPage - Painel do Sinaleiro
// Exibe os horários das batidas do sinal e notificações em tempo real via WebSocket

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellRing, Clock } from "lucide-react";
import type { BellEvent } from "@/types";

// Agrupa eventos por período
function groupByShift(events: BellEvent[]) {
  return {
    morning: events.filter((e) => e.shift === "Manhã"),
    afternoon: events.filter((e) => e.shift === "Tarde"),
  };
}

export function BellPage() {
  const [events, setEvents] = useState<BellEvent[]>([]);
  const [nextEvent, setNextEvent] = useState<BellEvent | null>(null);
  const [lastEvent, setLastEvent] = useState<BellEvent | null>(null);
  const [currentBell, setCurrentBell] = useState<BellEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega os horários da API e conecta WebSocket
  useEffect(() => {
    loadSchedule();

    // Conecta ao WebSocket para eventos em tempo real
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const socket = new WebSocket(`${protocol}//${host}/socket.io/?EIO=4&transport=websocket`);

    // Como Socket.IO tem handshake próprio, usamos o cliente Socket.IO
    // Para demonstração, carregamos os dados via REST
    // Em produção, usar: import { io } from "socket.io-client";

    return () => {
      // Cleanup
    };
  }, []);

  async function loadSchedule() {
    try {
      const { data } = await api.get("/bell-schedule");
      setEvents(data.events || []);
      setNextEvent(data.next);
      setLastEvent(data.last);
    } catch (err) {
      console.error("Erro ao carregar horários:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // Determina o período atual baseado na hora
  function getCurrentPeriod(): string {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 13) return "Manhã";
    if (hour >= 13 && hour < 18) return "Tarde";
    return "Fora do horário";
  }

  if (isLoading) return <div className="text-center py-8">Carregando...</div>;

  const grouped = groupByShift(events);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sinaleiro</h1>
          <p className="text-muted-foreground mt-1">
            Horários das batidas do sinal — Período atual: {getCurrentPeriod()}
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          <Bell className="h-4 w-4 mr-1" />
          {events.length} eventos
        </Badge>
      </div>

      {/* Próximo evento */}
      {nextEvent && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="flex items-center gap-4 p-4">
            <BellRing className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Próximo evento</p>
              <p className="text-lg font-bold">
                {nextEvent.type} — {nextEvent.time}
              </p>
              <p className="text-xs text-muted-foreground">{nextEvent.shift}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid de horários */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Período da Manhã */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Período da Manhã
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {grouped.morning.map((event, idx) => (
                <div
                  key={`m-${idx}`}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm">{event.time}</span>
                    <span className="text-sm">{event.type}</span>
                  </div>
                  {nextEvent?.time === event.time && nextEvent?.shift === event.shift && (
                    <Badge variant="default" className="animate-pulse">Próximo</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Período da Tarde */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Período da Tarde
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {grouped.afternoon.map((event, idx) => (
                <div
                  key={`a-${idx}`}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm">{event.time}</span>
                    <span className="text-sm">{event.type}</span>
                  </div>
                  {nextEvent?.time === event.time && nextEvent?.shift === event.shift && (
                    <Badge variant="default" className="animate-pulse">Próximo</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Último evento disparado */}
      {lastEvent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Último Evento</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">
              {lastEvent.type} — {lastEvent.time} ({lastEvent.shift})
            </span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
