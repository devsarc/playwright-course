import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, json, apiError } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  const workspaceId = req.nextUrl.searchParams.get('workspaceId');

  if (!workspaceId) return apiError('workspaceId query param is required', 400);

  const isMember = await prisma.workspaceMember.findFirst({
    where: { workspaceId, userId: session.userId },
  });
  if (!isMember) return apiError('Forbidden', 403);

  const projects = await prisma.project.findMany({
    where: { workspaceId },
    include: { _count: { select: { tasks: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return json(projects);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  const { name, description, workspaceId } = await req.json();

  if (!name || !workspaceId) return apiError('name and workspaceId are required', 400);

  const isMember = await prisma.workspaceMember.findFirst({
    where: { workspaceId, userId: session.userId },
  });
  if (!isMember) return apiError('Forbidden', 403);

  const project = await prisma.project.create({
    data: {
      name,
      description,
      workspaceId,
      columns: {
        createMany: {
          data: [
            { name: 'To Do', order: 0 },
            { name: 'In Progress', order: 1 },
            { name: 'Done', order: 2 },
          ],
        },
      },
    },
    include: { columns: true },
  });

  return json(project, 201);
}
