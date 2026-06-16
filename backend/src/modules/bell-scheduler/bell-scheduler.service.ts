// Bell Scheduler Service - Sistema de Horários do Sinaleiro
// Dispara eventos em tempo real via WebSocket nos horários programados

import { Server as SocketIOServer } from "socket.io";

// ============================================================
// Horários fixos dos sinos (definidos pela instituição)
// ============================================================
export interface BellEvent {
  time: string; // Formato HH:mm
  type: string;
  shift: string;
}

// Período da Manhã
const MORNING_EVENTS: BellEvent[] = [
  { time: "07:40", type: "Entrada", shift: "Manhã" },
  { time: "08:30", type: "Troca de Período", shift: "Manhã" },
  { time: "09:20", type: "Troca de Período", shift: "Manhã" },
  { time: "10:10", type: "Recreio", shift: "Manhã" },
  { time: "10:40", type: "Fim do Recreio", shift: "Manhã" },
  { time: "11:30", type: "Troca de Período", shift: "Manhã" },
  { time: "12:20", type: "Troca de Período", shift: "Manhã" },
  { time: "13:10", type: "Saída", shift: "Manhã" },
];

// Período da Tarde
const AFTERNOON_EVENTS: BellEvent[] = [
  { time: "13:30", type: "Entrada", shift: "Tarde" },
  { time: "14:20", type: "Troca de Período", shift: "Tarde" },
  { time: "15:10", type: "Troca de Período", shift: "Tarde" },
  { time: "16:00", type: "Lanche", shift: "Tarde" },
  { time: "16:20", type: "Recreio", shift: "Tarde" },
  { time: "17:10", type: "Fim do Recreio", shift: "Tarde" },
  { time: "18:00", type: "Saída", shift: "Tarde" },
];

export const ALL_BELL_EVENTS = [...MORNING_EVENTS, ...AFTERNOON_EVENTS];

// ============================================================
// BellScheduler - Gerencia o disparo programado dos sinos
// Usa setInterval para verificar a cada 30 segundos
// ============================================================
export class BellScheduler {
  private io: SocketIOServer;
  private intervalId: NodeJS.Timeout | null = null;
  private lastFiredEvents: Set<string> = new Set(); // Evita disparos duplicados

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  /**
   * Inicia o monitoramento dos horários dos sinos
   */
  start(): void {
    console.log("[BellScheduler] Iniciando monitoramento dos horários...");

    // Verifica a cada 30 segundos se há eventos para disparar
    this.intervalId = setInterval(() => {
      this.checkAndFireEvents();
    }, 30000);

    // Dispara eventos que já deveriam ter ocorrido hoje (para recuperação)
    this.fireMissedEvents();
  }

  /**
   * Para o monitoramento
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Verifica e dispara eventos cujo horário corresponde ao momento atual
   */
  private checkAndFireEvents(): void {
    const now = new Date();
    const currentTime = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    for (const event of ALL_BELL_EVENTS) {
      if (event.time === currentTime) {
        const eventKey = `${event.time}-${event.type}-${event.shift}`;

        // Evita disparar o mesmo evento múltiplas vezes
        if (!this.lastFiredEvents.has(eventKey)) {
          this.fireEvent(event);
          this.lastFiredEvents.add(eventKey);

          // Limpa o evento após 5 minutos para permitir re-disparo
          setTimeout(() => {
            this.lastFiredEvents.delete(eventKey);
          }, 5 * 60 * 1000);
        }
      }
    }
  }

  /**
   * Dispara eventos que ocorreram enquanto o servidor estava offline
   * (útil para recuperação após queda)
   */
  private fireMissedEvents(): void {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const event of ALL_BELL_EVENTS) {
      const [h, m] = event.time.split(":").map(Number);
      const eventMinutes = h * 60 + m;

      // Se o evento ocorreu nos últimos 5 minutos, dispara
      if (eventMinutes <= currentMinutes && currentMinutes - eventMinutes <= 5) {
        const eventKey = `${event.time}-${event.type}-${event.shift}`;
        if (!this.lastFiredEvents.has(eventKey)) {
          this.fireEvent(event);
          this.lastFiredEvents.add(eventKey);
        }
      }
    }
  }

  /**
   * Dispara o evento via WebSocket para todos os clientes conectados
   */
  private fireEvent(event: BellEvent): void {
    const payload = {
      type: "BELL_EVENT",
      data: {
        ...event,
        timestamp: new Date().toISOString(),
        mensagem: `🔔 ${event.type} - ${event.shift} (${event.time})`,
      },
    };

    console.log(`[BellScheduler] Disparando: ${payload.data.mensagem}`);
    this.io.emit("bell-event", payload.data);
  }

  /**
   * Retorna todos os eventos do dia
   */
  getAllEvents(): BellEvent[] {
    return ALL_BELL_EVENTS;
  }

  /**
   * Retorna o próximo evento programado
   */
  getNextEvent(): BellEvent | null {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const event of ALL_BELL_EVENTS) {
      const [h, m] = event.time.split(":").map(Number);
      const eventMinutes = h * 60 + m;

      if (eventMinutes > currentMinutes) {
        return event;
      }
    }

    return null;
  }

  /**
   * Retorna o último evento que ocorreu hoje
   */
  getLastEvent(): BellEvent | null {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    let lastEvent: BellEvent | null = null;

    for (const event of ALL_BELL_EVENTS) {
      const [h, m] = event.time.split(":").map(Number);
      const eventMinutes = h * 60 + m;

      if (eventMinutes <= currentMinutes) {
        lastEvent = event;
      }
    }

    return lastEvent;
  }
}
