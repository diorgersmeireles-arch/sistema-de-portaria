# Sistema de Portaria - Fundação Educacional João XXIII

Sistema completo de gestão de portaria com controle de acesso, cadastros, câmeras IP, empréstimo de chaves, agendamento de visitas e sinaleiro eletrônico.

**Desenvolvido pela MADev**

---

## Stack Tecnológica

- **Backend:** Node.js + Express + TypeScript + Prisma ORM
- **Frontend:** React + Vite + TailwindCSS + Shadcn/UI
- **Banco:** PostgreSQL
- **Autenticação:** JWT (JSON Web Token)
- **Tempo Real:** WebSocket (Socket.IO) para sinaleiro
- **Validação:** Zod (backend e frontend)

## Módulos

| Módulo | Descrição |
|--------|-----------|
| Autenticação | Login JWT com RBAC (5 perfis) |
| Alunos | Cadastro com vínculo a responsáveis |
| Responsáveis | Cadastro de pais/responsáveis |
| Visitantes | Registro de entrada |
| Fornecedores | Cadastro com renovação obrigatória a cada 6 meses |
| Chaves | Sistema de empréstimo e devolução |
| Atrasos | Registro de entrada tardia |
| Agendamentos | Pré-agendamento de visitas |
| Câmeras IP | Dashboard em grid |
| Sinaleiro | Horários das batidas do sinal em tempo real |

## Perfis de Acesso (RBAC)

- **Superadmin** — Acesso total
- **Coordenação** — Alunos, Responsáveis, Atrasos, Agendamentos, Câmeras
- **Supervisão** — Atrasos, Chaves, Câmeras
- **Secretaria** — Alunos, Responsáveis, Fornecedores, Agendamentos
- **Portaria** — Visitantes, Fornecedores, Chaves, Atrasos, Câmeras

## Pré-requisitos

- Node.js >= 22
- PostgreSQL
- npm >= 10

## Configuração

1. Clone o repositório e instale as dependências:

```bash
npm install
```

2. Configure o banco de dados PostgreSQL no arquivo `backend/.env`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/portaria_joaoxxiii"
JWT_SECRET="sua-chave-secreta-aqui"
```

3. Execute as migrations e seed:

```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

4. Inicie o desenvolvimento:

```bash
# Na raiz do projeto (inicia backend + frontend):
npm run dev

# Ou individualmente:
npm run dev:backend   # :3001
npm run dev:frontend  # :5173
```

## Credenciais Padrão (Seed)

| Email | Senha | Perfil |
|-------|-------|--------|
| ti@joaoxxiii.com | admin123 | Superadmin |
| washington.meireles@joaoxxiii.com | admin123 | Superadmin |
| rodrigo.bairos@joaoxxiii.com | admin123 | Superadmin |
| vitor.batista@joaoxxiii.com | admin123 | Superadmin |

## Estrutura do Projeto

```
sistema-de-portaria/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Schema do banco de dados
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── app.ts             # Config Express + WebSocket
│   │   ├── lib/               # Utilitários (Prisma, JWT, Zod)
│   │   ├── middleware/        # Auth, RBAC, Error Handler
│   │   ├── modules/           # Módulos da API
│   │   │   ├── auth/
│   │   │   ├── students/
│   │   │   ├── guardians/
│   │   │   ├── visitors/
│   │   │   ├── suppliers/
│   │   │   ├── keys/
│   │   │   ├── delays/
│   │   │   ├── visit-schedules/
│   │   │   ├── cameras/
│   │   │   └── bell-scheduler/
│   │   └── seed.ts            # Dados iniciais
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Rotas e providers
│   │   ├── main.tsx           # Entry point React
│   │   ├── components/
│   │   │   ├── ui/            # Componentes Shadcn/UI
│   │   │   └── layout/        # AppShell, Sidebar, Footer
│   │   ├── context/           # AuthContext
│   │   ├── lib/               # API client, utils
│   │   ├── types/             # Tipagens TypeScript
│   │   └── pages/             # Páginas do sistema
│   └── package.json
└── package.json                # Scripts do monorepo
```
