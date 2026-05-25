import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { TaskDetail } from '@/components/tasks/task-detail';

export const metadata: Metadata = { title: 'Task' };

export default async function TaskDetailPage(
  props: {
    params: Promise<{ id: string; taskId: string }>;
  }
) {
  const params = await props.params;
  const session = await auth();
  if (!session) return null;

  const task = await prisma.task.findFirst({
    where: {
      id: params.taskId,
      project: { workspace: { members: { some: { userId: session.user.id } } } },
    },
    include: {
      assignee: { select: { name: true, image: true } },
    },
  });

  if (!task) notFound();

  return (
    <div>
      <TaskDetail task={task} />
    </div>
  );
}
