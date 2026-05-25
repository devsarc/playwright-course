'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FirstProjectPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // In a real flow this would POST to /api/projects with the workspace ID.
    // For now just redirect to dashboard.
    router.push('/dashboard');
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-3xl font-bold">Create your first project</h1>
      <p className="mt-2 text-muted-foreground">
        A project contains tasks organized on a kanban board.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="project-name" className="block text-sm font-medium">
            Project name
          </label>
          <Input
            id="project-name"
            placeholder="My first project"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating…' : 'Create project and go to dashboard'}
        </Button>
      </form>
    </div>
  );
}
