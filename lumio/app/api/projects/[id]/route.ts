import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, json, apiError } from '@/lib/api-utils';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, props: Params) {
  const params = await props.params;
  const session = await requireAuth();

  const project = await prisma.project.findFirst({
    where: {
      id: params.id,
      workspace: { members: { some: { userId: session.userId } } },
    },
    include: {
      columns: { include: { tasks: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } },
    },
  });

  if (!project) return apiError('Project not found', 404);
  return json(project);
}

export async function PATCH(req: NextRequest, props: Params) {
  const params = await props.params;
  const session = await requireAuth();
  const body = await req.json();

  const project = await prisma.project.findFirst({
    where: {
      id: params.id,
      workspace: { members: { some: { userId: session.userId } } },
    },
  });
  if (!project) return apiError('Project not found', 404);

  const updated = await prisma.project.update({
    where: { id: params.id },
    data: { name: body.name, description: body.description, status: body.status },
  });

  return json(updated);
}

export async function DELETE(_req: NextRequest, props: Params) {
  const params = await props.params;
  const session = await requireAuth();

  const project = await prisma.project.findFirst({
    where: {
      id: params.id,
      workspace: {
        members: { some: { userId: session.userId, role: { in: ['OWNER', 'ADMIN'] } } },
      },
    },
  });
  if (!project) return apiError('Project not found or insufficient permissions', 404);

  await prisma.project.delete({ where: { id: params.id } });
  return json({ deleted: true });
}
