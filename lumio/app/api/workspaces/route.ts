import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, json, apiError } from '@/lib/api-utils';

export async function GET() {
  const session = await requireAuth();

  const workspaces = await prisma.workspace.findMany({
    where: {
      members: { some: { userId: session.userId } },
    },
    include: { _count: { select: { members: true, projects: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return json(workspaces);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  const { name, slug, description } = await req.json();

  if (!name || !slug) return apiError('name and slug are required', 400);

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return apiError('slug may only contain lowercase letters, numbers, and hyphens', 400);
  }

  try {
    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        description,
        members: {
          create: { userId: session.userId, role: 'OWNER' },
        },
      },
    });
    return json(workspace, 201);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') {
      return apiError('A workspace with this slug already exists', 409);
    }
    throw err;
  }
}
