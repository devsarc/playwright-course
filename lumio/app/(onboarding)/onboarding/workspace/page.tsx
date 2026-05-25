'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CreateWorkspacePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    // Auto-generate slug from name
    setSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Could not create workspace.');
      return;
    }

    router.push('/onboarding/invite');
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-3xl font-bold">Create your workspace</h1>
      <p className="mt-2 text-muted-foreground">
        A workspace is where your team&apos;s projects and tasks live.
      </p>

      {error && (
        <div role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="workspace-name" className="block text-sm font-medium">
            Workspace name
          </label>
          <Input
            id="workspace-name"
            placeholder="Acme Corp"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="workspace-slug" className="block text-sm font-medium">
            URL slug
          </label>
          <div className="mt-1 flex items-center rounded-md border bg-background">
            <span className="rounded-l-md border-r bg-muted px-3 py-2 text-sm text-muted-foreground">
              lumio.app/
            </span>
            <Input
              id="workspace-slug"
              placeholder="acme-corp"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="rounded-l-none border-0"
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating…' : 'Create workspace'}
        </Button>
      </form>
    </div>
  );
}
