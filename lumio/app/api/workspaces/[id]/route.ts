import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, json, apiError } from '@/lib/api-utils';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, props: Params) {
  const params = await props.params;
  const session = await requireAuth();

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: params.id,
      members: { some: { userId: session.userId } },
    },
    include: { members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } } },
  });

  if (!workspace) return apiError('Workspace not found', 404);
  return json(workspace);
}

export async function PATCH(req: NextRequest, props: Params) {
  const params = await props.params;
  const session = await requireAuth();
  const body = await req.json();

  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId: params.id, userId: session.userId, role: { in: ['OWNER', 'ADMIN'] } },
  });
  if (!member) return apiError('Forbidden', 403);

  const workspace = await prisma.workspace.update({
    where: { id: params.id },
    data: { name: body.name, description: body.description },
  });

  return json(workspace);
}

export async function DELETE(_req: NextRequest, props: Params) {
  const params = await props.params;
  const session = await requireAuth();

  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId: params.id, userId: session.userId, role: 'OWNER' },
  });
  if (!member) return apiError('Forbidden', 403);

  await prisma.workspace.delete({ where: { id: params.id } });
  return json({ deleted: true });
}
