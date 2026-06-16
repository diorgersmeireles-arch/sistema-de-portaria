// Seed Script - Popula o banco com dados iniciais
// Cria superadmins e dados de demonstração

import { PrismaClient, Role, Periodo, KeyStatus, SupplierStatus, VisitStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // ============================================================
  // 1. Criação dos Superadmins iniciais
  // ============================================================
  const superadminEmails = [
    "ti@joaoxxiii.com",
    "washington.meireles@joaoxxiii.com",
    "rodrigo.bairos@joaoxxiii.com",
    "vitor.batista@joaoxxiii.com",
  ];

  // Hash fixo para demonstração (senha: admin123)
  // Em produção, cada admin deve alterar a senha no primeiro acesso
  const defaultPasswordHash = await bcrypt.hash("admin123", 12);

  for (const email of superadminEmails) {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (!existing) {
      await prisma.user.create({
        data: {
          email,
          passwordHash: defaultPasswordHash,
          name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          role: Role.SUPERADMIN,
        },
      });
      console.log(`  ✅ Superadmin criado: ${email}`);
    } else {
      console.log(`  ⏭️  Superadmin já existe: ${email}`);
    }
  }

  // ============================================================
  // 2. Dados de demonstração: Alunos
  // ============================================================
  const alunos = [
    { nome: "Ana Beatriz Silva", turma: "3º Ano A", periodo: Periodo.MANHA },
    { nome: "Carlos Eduardo Santos", turma: "3º Ano A", periodo: Periodo.MANHA },
    { nome: "Maria Fernanda Oliveira", turma: "2º Ano B", periodo: Periodo.TARDE },
    { nome: "Pedro Henrique Costa", turma: "2º Ano B", periodo: Periodo.TARDE },
    { nome: "Julia Almeida Rodrigues", turma: "1º Ano A", periodo: Periodo.MANHA },
  ];

  for (const aluno of alunos) {
    await prisma.student.upsert({
      where: { id: aluno.nome }, // Não vai encontrar, sempre cria
      update: {},
      create: aluno,
    });
  }
  console.log("  ✅ Alunos de demonstração criados");

  // ============================================================
  // 3. Dados de demonstração: Responsáveis
  // ============================================================
  const responsaveis = [
    { nome: "Lucia Silva", documento: "123.456.789-00", contato: "(11) 99999-8888" },
    { nome: "Roberto Santos", documento: "987.654.321-00", contato: "(11) 97777-6666" },
  ];

  for (const resp of responsaveis) {
    await prisma.guardian.upsert({
      where: { documento: resp.documento },
      update: {},
      create: resp,
    });
  }
  console.log("  ✅ Responsáveis de demonstração criados");

  // ============================================================
  // 4. Dados de demonstração: Chaves
  // ============================================================
  const chaves = [
    { salaSetor: "Sala da Diretoria", codigoChave: "DIR-001" },
    { salaSetor: "Sala dos Professores", codigoChave: "PROF-001" },
    { salaSetor: "Laboratório de Informática", codigoChave: "LAB-001" },
    { salaSetor: "Depósito de Materiais", codigoChave: "DEP-001" },
  ];

  for (const chave of chaves) {
    await prisma.key.upsert({
      where: { codigoChave: chave.codigoChave },
      update: {},
      create: chave,
    });
  }
  console.log("  ✅ Chaves de demonstração criadas");

  // ============================================================
  // 5. Dados de demonstração: Fornecedores
  // ============================================================
  const seisMesesAtras = new Date();
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 7); // 7 meses atrás (vencido)

  const umMesAtras = new Date();
  umMesAtras.setMonth(umMesAtras.getMonth() - 1); // 1 mês atrás (válido)

  const fornecedores = [
    {
      empresa: "Distribuidora Alimentos Ltda",
      nomeRepresentante: "João Pereira",
      documento: "11.222.333/0001-44",
      lastRenewal: umMesAtras,
    },
    {
      empresa: "Material Escolar ABC",
      nomeRepresentante: "Maria Santos",
      documento: "55.666.777/0001-88",
      lastRenewal: seisMesesAtras, // Fornecedor com registro vencido
    },
  ];

  for (const forn of fornecedores) {
    await prisma.supplier.upsert({
      where: { documento: forn.documento },
      update: {},
      create: forn,
    });
  }
  console.log("  ✅ Fornecedores de demonstração criados");

  console.log("\n🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
