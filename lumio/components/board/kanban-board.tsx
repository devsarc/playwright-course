'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { BoardColumn } from './board-column';
import { TaskCard, type TaskCardData } from './task-card';

export interface Column {
  id: string;
  name: string;
  tasks: TaskCardData[];
}

interface KanbanBoardProps {
  initialColumns: Column[];
  onTaskMove?: (taskId: string, newColumnId: string, newOrder: number) => Promise<void>;
  onTaskClick?: (taskId: string) => void;
}

export function KanbanBoard({ initialColumns, onTaskMove, onTaskClick }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [activeTask, setActiveTask] = useState<TaskCardData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function findColumnOfTask(taskId: string): Column | undefined {
    return columns.find((col) => col.tasks.some((t) => t.id === taskId));
  }

  function handleDragStart(event: DragStartEvent) {
    const task = columns.flatMap((c) => c.tasks).find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCol = findColumnOfTask(activeId);
    const overCol =
      columns.find((c) => c.id === overId) ?? findColumnOfTask(overId);

    if (!activeCol || !overCol || activeCol.id === overCol.id) return;

    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === activeCol.id) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== activeId) };
        }
        if (col.id === overCol.id) {
          const task = activeCol.tasks.find((t) => t.id === activeId)!;
          const overIndex = col.tasks.findIndex((t) => t.id === overId);
          const insertAt = overIndex >= 0 ? overIndex : col.tasks.length;
          const newTasks = [...col.tasks];
          newTasks.splice(insertAt, 0, task);
          return { ...col, tasks: newTasks };
        }
        return col;
      }),
    );
  }

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      setColumns((prev) => {
        const activeCol = prev.find((c) => c.tasks.some((t) => t.id === activeId));
        const overCol = prev.find((c) => c.id === overId || c.tasks.some((t) => t.id === overId));

        if (!activeCol || !overCol) return prev;

        if (activeCol.id === overCol.id) {
          const oldIndex = activeCol.tasks.findIndex((t) => t.id === activeId);
          const newIndex = activeCol.tasks.findIndex((t) => t.id === overId);
          if (oldIndex === newIndex) return prev;

          const reordered = arrayMove(activeCol.tasks, oldIndex, newIndex);
          return prev.map((c) =>
            c.id === activeCol.id ? { ...c, tasks: reordered } : c,
          );
        }

        return prev;
      });

      if (onTaskMove) {
        const newCol = columns.find((c) => c.id === overId || c.tasks.some((t) => t.id === overId));
        if (newCol) {
          const newOrder = newCol.tasks.findIndex((t) => t.id === activeId);
          await onTaskMove(activeId, newCol.id, newOrder);
        }
      }
    },
    [columns, onTaskMove],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4" role="region" aria-label="Kanban board">
        {columns.map((col) => (
          <BoardColumn
            key={col.id}
            id={col.id}
            name={col.name}
            tasks={col.tasks}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-2 opacity-90">
            <TaskCard task={activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
