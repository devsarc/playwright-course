import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, json, apiError } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (session.role !== 'ADMIN') return apiError('Forbidden', 403);

  const workspaceId = req.nextUrl.searchParams.get('workspaceId');
  if (!workspaceId) return apiError('workspaceId is required', 400);

  const flags = await prisma.featureFlag.findMany({
    where: { workspaceId },
    orderBy: { key: 'asc' },
  });

  return json(flags);
}

export async function PATCH(req: NextRequest) {
  const session = await requireAuth();
  if (session.role !== 'ADMIN') return apiError('Forbidden', 403);

  const { id, enabled } = await req.json();
  if (!id || typeof enabled !== 'boolean') {
    return apiError('id and enabled are required', 400);
  }

  const flag = await prisma.featureFlag.update({
    where: { id },
    data: { enabled },
  });

  return json(flag);
}
