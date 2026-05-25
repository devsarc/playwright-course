'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard, type TaskCardData } from './task-card';

interface BoardColumnProps {
  id: string;
  name: string;
  tasks: TaskCardData[];
  onTaskClick?: (taskId: string) => void;
}

export function BoardColumn({ id, name, tasks, onTaskClick }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      data-testid="board-column"
      data-column-id={id}
      className={`flex w-72 shrink-0 flex-col rounded-xl border bg-muted/30 p-3 transition-colors ${
        isOver ? 'bg-brand-50' : ''
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-gray-700">{name}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex flex-col gap-2 min-h-[60px]">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
