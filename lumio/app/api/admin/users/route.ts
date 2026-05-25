import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, json, apiError } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (session.role !== 'ADMIN') return apiError('Forbidden', 403);

  const url = req.nextUrl;
  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  const limit = parseInt(url.searchParams.get('limit') ?? '20', 10);
  const sortBy = (url.searchParams.get('sortBy') ?? 'createdAt') as 'email' | 'name' | 'createdAt';
  const sortOrder = (url.searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc';
  const role = url.searchParams.get('role') as 'ADMIN' | 'MEMBER' | null;

  const where = role ? { role } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        _count: { select: { memberships: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return json({ users, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function DELETE(req: NextRequest) {
  const session = await requireAuth();
  if (session.role !== 'ADMIN') return apiError('Forbidden', 403);

  const { userIds } = await req.json();
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return apiError('userIds array is required', 400);
  }

  if (userIds.includes(session.userId)) {
    return apiError('Cannot delete your own account', 400);
  }

  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  return json({ deleted: userIds.length });
}
