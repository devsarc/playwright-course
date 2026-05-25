'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface TaskCardData {
  id: string;
  title: string;
  priority: string;
  assignee?: { name: string | null; image: string | null } | null;
}

interface TaskCardProps {
  task: TaskCardData;
  onClick?: (taskId: string) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-testid="task-card"
      data-task-id={task.id}
      className="rounded-lg border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
      role="button"
      aria-label={`Task: ${task.title}`}
      onClick={() => onClick?.(task.id)}
    >
      <p className="text-sm font-medium leading-snug">{task.title}</p>
      <div className="mt-2 flex items-center justify-between">
        <span
          className={`rounded px-1.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.MEDIUM}`}
        >
          {task.priority}
        </span>
        {task.assignee?.name && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs text-white">
            {task.assignee.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}
