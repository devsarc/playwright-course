import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { KanbanBoard, type Column } from '@/components/board/kanban-board';

export const metadata: Metadata = { title: 'Project Board' };

export default async function ProjectBoardPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const session = await auth();
  if (!session) return null;

  const project = await prisma.project.findFirst({
    where: {
      id: params.id,
      workspace: { members: { some: { userId: session.user.id } } },
    },
    include: {
      columns: {
        orderBy: { order: 'asc' },
        include: {
          tasks: {
            orderBy: { order: 'asc' },
            include: {
              assignee: { select: { name: true, image: true } },
            },
          },
        },
      },
    },
  });

  if (!project) notFound();

  const columns: Column[] = project.columns.map((col) => ({
    id: col.id,
    name: col.name,
    tasks: col.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      priority: task.priority,
      assignee: task.assignee,
    })),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <a
          href={`/api/pdf?projectId=${project.id}`}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          aria-label="Export project as PDF"
        >
          Export PDF
        </a>
      </div>
      <KanbanBoard initialColumns={columns} />
    </div>
  );
}
