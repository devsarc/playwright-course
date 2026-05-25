import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserTable } from '@/components/admin/user-table';

export const metadata: Metadata = { title: 'Admin — Users' };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/dashboard');

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { memberships: true } },
      },
    }),
    prisma.user.count(),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">User Management</h1>
      <UserTable
        initialUsers={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
        total={total}
      />
    </div>
  );
}
