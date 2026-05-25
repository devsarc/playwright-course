import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, json, apiError } from '@/lib/api-utils';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, props: Params) {
  const params = await props.params;
  const session = await requireAuth();

  const task = await prisma.task.findFirst({
    where: {
      id: params.id,
      project: { workspace: { members: { some: { userId: session.userId } } } },
    },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      creator: { select: { id: true, name: true } },
      comments: { include: { author: { select: { id: true, name: true, image: true } } }, orderBy: { createdAt: 'asc' } },
      attachments: true,
      labels: { include: { label: true } },
    },
  });

  if (!task) return apiError('Task not found', 404);
  return json(task);
}

export async function PATCH(req: NextRequest, props: Params) {
  const params = await props.params;
  const session = await requireAuth();
  const body = await req.json();

  const task = await prisma.task.findFirst({
    where: {
      id: params.id,
      project: { workspace: { members: { some: { userId: session.userId } } } },
    },
  });
  if (!task) return apiError('Task not found', 404);

  const updated = await prisma.task.update({
    where: { id: params.id },
    data: {
      title: body.title,
      content: body.content,
      priority: body.priority,
      status: body.status,
      columnId: body.columnId,
      assigneeId: body.assigneeId,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      order: body.order,
    },
  });

  return json(updated);
}

export async function DELETE(_req: NextRequest, props: Params) {
  const params = await props.params;
  const session = await requireAuth();

  const task = await prisma.task.findFirst({
    where: {
      id: params.id,
      project: { workspace: { members: { some: { userId: session.userId } } } },
    },
  });
  if (!task) return apiError('Task not found', 404);

  await prisma.task.delete({ where: { id: params.id } });
  return json({ deleted: true });
}
