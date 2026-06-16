// Types - Tipagens compartilhadas do frontend

// ============================================================
// Tipos de Usuário e Autenticação
// ============================================================
export type UserRole = "SUPERADMIN" | "COORDENACAO" | "SUPERVISAO" | "SECRETARIA" | "PORTARIA";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive?: boolean;
  createdAt?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

// ============================================================
// Tipos de Alunos
// ============================================================
export type Periodo = "MANHA" | "TARDE";

export interface Student {
  id: string;
  nome: string;
  turma: string;
  periodo: Periodo;
  createdAt: string;
  responsaveis?: Guardian[];
}

export interface StudentFormData {
  nome: string;
  turma: string;
  periodo: Periodo;
}

// ============================================================
// Tipos de Responsáveis
// ============================================================
export interface Guardian {
  id: string;
  nome: string;
  documento: string;
  contato: string;
  alunosVinculados?: Student[];
}

export interface GuardianFormData {
  nome: string;
  documento: string;
  contato: string;
}

// ============================================================
// Tipos de Visitantes
// ============================================================
export interface Visitor {
  id: string;
  nome: string;
  documento?: string;
  empresaMotivo: string;
  fotoUrl?: string;
  dataEntrada: string;
}

// ============================================================
// Tipos de Fornecedores
// ============================================================
export type SupplierStatusType = "ATIVO" | "BLOQUEADO_RENOVACAO";

export interface Supplier {
  id: string;
  empresa: string;
  nomeRepresentante: string;
  documento: string;
  fotoUrl?: string;
  lastRenewal: string;
  status: SupplierStatusType;
  diasRestantes: number;
  precisaRenovar: boolean;
}

// ============================================================
// Tipos de Chaves
// ============================================================
export type KeyStatusType = "DISPONIVEL" | "EMPRESTADA";

export interface KeyItem {
  id: string;
  salaSetor: string;
  codigoChave: string;
  status: KeyStatusType;
  usuarioAtual?: { id: string; name: string } | null;
}

export interface KeyLog {
  id: string;
  keyId: string;
  userId: string;
  borrowedAt: string;
  returnedAt?: string;
  key?: { id: string; salaSetor: string; codigoChave: string };
  user?: { id: string; name: string };
}

// ============================================================
// Tipos de Atrasos
// ============================================================
export interface Delay {
  id: string;
  studentId?: string;
  userId?: string;
  horarioAtraso: string;
  justificativa?: string;
  student?: { id: string; nome: string; turma: string };
  user?: { id: string; name: string };
  comprovante?: {
    tipo: string;
    data: string;
    aluno?: string;
    funcionario?: string;
    protocolo: string;
  };
}

// ============================================================
// Tipos de Agendamentos
// ============================================================
export type VisitStatusType = "PENDENTE" | "CONCLUIDO" | "CANCELADO";

export interface VisitSchedule {
  id: string;
  nomeVisitante: string;
  documento?: string;
  dataHoraAgendada: string;
  setorDestino: string;
  status: VisitStatusType;
  observacoes?: string;
}

// ============================================================
// Tipos de Câmeras
// ============================================================
export interface Camera {
  id: string;
  nome: string;
  localizacao: string;
  tipo: string;
  ativa: boolean;
  url: string;
}

// ============================================================
// Tipos do Sinaleiro
// ============================================================
export interface BellEvent {
  time: string;
  type: string;
  shift: string;
  timestamp?: string;
  mensagem?: string;
}
