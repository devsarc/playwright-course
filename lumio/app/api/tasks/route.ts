import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, json, apiError } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  const projectId = req.nextUrl.searchParams.get('projectId');

  if (!projectId) return apiError('projectId query param is required', 400);

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspace: { members: { some: { userId: session.userId } } },
    },
  });
  if (!project) return apiError('Project not found', 404);

  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      creator: { select: { id: true, name: true } },
      labels: { include: { label: true } },
      _count: { select: { comments: true, attachments: true } },
    },
    orderBy: { order: 'asc' },
  });

  return json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  const { title, projectId, columnId, priority, assigneeId, dueDate } = await req.json();

  if (!title || !projectId) return apiError('title and projectId are required', 400);

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspace: { members: { some: { userId: session.userId } } },
    },
  });
  if (!project) return apiError('Project not found', 404);

  const task = await prisma.task.create({
    data: {
      title,
      projectId,
      columnId,
      priority: priority ?? 'MEDIUM',
      assigneeId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      creatorId: session.userId,
    },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
    },
  });

  return json(task, 201);
}
