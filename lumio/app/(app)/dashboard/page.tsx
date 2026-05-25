import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;

  const taskStats = await prisma.task.groupBy({
    by: ['status'],
    where: {
      project: {
        workspace: { members: { some: { userId: session.user.id } } },
      },
    },
    _count: { _all: true },
  });

  const stats = {
    todo: taskStats.find((s) => s.status === 'TODO')?._count._all ?? 0,
    inProgress: taskStats.find((s) => s.status === 'IN_PROGRESS')?._count._all ?? 0,
    inReview: taskStats.find((s) => s.status === 'IN_REVIEW')?._count._all ?? 0,
    done: taskStats.find((s) => s.status === 'DONE')?._count._all ?? 0,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">
        Welcome back, {session.user.name ?? session.user.email}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'To Do', value: stats.todo, color: 'bg-gray-100' },
          { label: 'In Progress', value: stats.inProgress, color: 'bg-blue-100' },
          { label: 'In Review', value: stats.inReview, color: 'bg-yellow-100' },
          { label: 'Done', value: stats.done, color: 'bg-green-100' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className={`rounded-xl p-5 ${color}`}
            data-testid={`stat-card-${label.toLowerCase().replace(' ', '-')}`}
          >
            <p className="text-sm font-medium text-gray-700">{label}</p>
            <p className="mt-1 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <DashboardCharts stats={stats} />
      </div>
    </div>
  );
}
