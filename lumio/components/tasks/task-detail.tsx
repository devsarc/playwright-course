'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUpload } from './file-upload';

interface TaskDetailProps {
  task: {
    id: string;
    title: string;
    content: string | null;
    priority: string;
    status: string;
    assignee?: { name: string | null } | null;
  };
}

export function TaskDetail({ task }: TaskDetailProps) {
  const [title, setTitle] = useState(task.title);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
            {task.priority}
          </span>
          <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
            {task.status}
          </span>
        </div>
        <Button onClick={handleSave} size="sm">
          {saved ? '✓ Saved' : 'Save'}
        </Button>
      </div>

      <div className="mb-6">
        <label htmlFor="task-title" className="block text-sm font-medium">
          Title
        </label>
        <Input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 text-lg font-semibold"
        />
      </div>

      {task.assignee?.name && (
        <div className="mb-6">
          <p className="text-sm font-medium">Assignee</p>
          <p className="mt-1 text-sm text-muted-foreground">{task.assignee.name}</p>
        </div>
      )}

      <div className="mb-6">
        <p className="mb-2 text-sm font-medium">Description</p>
        {/* The editor renders inside an iframe so that M24 teaches frameLocator() */}
        <div className="overflow-hidden rounded-lg border">
          <iframe
            src="/editor"
            title="Task description editor"
            className="h-80 w-full border-0"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>

      <div className="mb-6">
        <p className="mb-2 text-sm font-medium">Attachments</p>
        <FileUpload taskId={task.id} />
      </div>
    </div>
  );
}
