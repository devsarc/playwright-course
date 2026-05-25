import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

async function main() {
  if (!process.env.DATABASE_URL) process.env.DATABASE_URL = 'file:./prisma/dev.db';
  const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  // ── Users ────────────────────────────────────────────────────────────────
  const memberPassword = await bcrypt.hash('TestPassword123!', 12);
  const adminPassword = await bcrypt.hash('AdminPassword123!', 12);

  const testUser = await prisma.user.upsert({
    where: { email: 'test@lumio.dev' },
    update: {},
    create: {
      email: 'test@lumio.dev',
      name: 'Test User',
      password: memberPassword,
      emailVerified: new Date(),
      role: 'MEMBER',
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@lumio.dev' },
    update: {},
    create: {
      email: 'admin@lumio.dev',
      name: 'Admin User',
      password: adminPassword,
      emailVerified: new Date(),
      role: 'ADMIN',
    },
  });

  // ── Workspace ─────────────────────────────────────────────────────────────
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'test-workspace' },
    update: {},
    create: {
      name: 'Test Workspace',
      slug: 'test-workspace',
      description: 'Workspace used by automated tests',
    },
  });

  // ── Workspace members ─────────────────────────────────────────────────────
  await prisma.workspaceMember.upsert({
    where: { userId_workspaceId: { userId: adminUser.id, workspaceId: workspace.id } },
    update: {},
    create: { userId: adminUser.id, workspaceId: workspace.id, role: 'OWNER' },
  });

  await prisma.workspaceMember.upsert({
    where: { userId_workspaceId: { userId: testUser.id, workspaceId: workspace.id } },
    update: {},
    create: { userId: testUser.id, workspaceId: workspace.id, role: 'MEMBER' },
  });

  // ── Project ───────────────────────────────────────────────────────────────
  const project = await prisma.project.upsert({
    where: { id: 'seed-project-001' },
    update: {},
    create: {
      id: 'seed-project-001',
      name: 'Test Project',
      description: 'Project used by automated tests',
      workspaceId: workspace.id,
    },
  });

  // Public project for /explore page (visible without auth)
  await prisma.project.upsert({
    where: { id: 'seed-project-public' },
    update: {},
    create: {
      id: 'seed-project-public',
      name: 'Open Source Roadmap',
      description: 'Public roadmap for the Lumio open-source edition.',
      isPublic: true,
      workspaceId: workspace.id,
    },
  });

  // ── Board columns ──────────────────────────────────────────────────────────
  const col1 = await prisma.boardColumn.upsert({
    where: { id: 'seed-col-todo' },
    update: {},
    create: { id: 'seed-col-todo', name: 'To Do', order: 0, projectId: project.id },
  });

  const col2 = await prisma.boardColumn.upsert({
    where: { id: 'seed-col-inprogress' },
    update: {},
    create: { id: 'seed-col-inprogress', name: 'In Progress', order: 1, projectId: project.id },
  });

  await prisma.boardColumn.upsert({
    where: { id: 'seed-col-done' },
    update: {},
    create: { id: 'seed-col-done', name: 'Done', order: 2, projectId: project.id },
  });

  // ── Tasks ─────────────────────────────────────────────────────────────────
  await prisma.task.upsert({
    where: { id: 'seed-task-001' },
    update: {},
    create: {
      id: 'seed-task-001',
      title: 'Set up CI pipeline',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      projectId: project.id,
      columnId: col2.id,
      creatorId: adminUser.id,
      assigneeId: testUser.id,
    },
  });

  await prisma.task.upsert({
    where: { id: 'seed-task-002' },
    update: {},
    create: {
      id: 'seed-task-002',
      title: 'Write onboarding documentation',
      priority: 'MEDIUM',
      status: 'TODO',
      projectId: project.id,
      columnId: col1.id,
      creatorId: adminUser.id,
    },
  });

  await prisma.task.upsert({
    where: { id: 'seed-task-003' },
    update: {},
    create: {
      id: 'seed-task-003',
      title: 'Design system colors',
      priority: 'LOW',
      status: 'TODO',
      projectId: project.id,
      columnId: col1.id,
      creatorId: testUser.id,
    },
  });

  // ── Feature flags ─────────────────────────────────────────────────────────
  await prisma.featureFlag.upsert({
    where: { key_workspaceId: { key: 'ai-suggestions', workspaceId: workspace.id } },
    update: {},
    create: {
      key: 'ai-suggestions',
      enabled: false,
      description: 'Show AI task suggestions in task creation form',
      workspaceId: workspace.id,
    },
  });

  console.log('✅ Seed complete');
  console.log(`   Users: ${testUser.email}, ${adminUser.email}`);
  console.log(`   Workspace: ${workspace.slug}`);
  console.log(`   Project: ${project.name} (3 tasks)`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
