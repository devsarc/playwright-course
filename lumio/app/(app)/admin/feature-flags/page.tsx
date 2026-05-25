'use client';

import { useState, useEffect } from 'react';

interface FlagRow {
  id: string;
  key: string;
  enabled: boolean;
  description: string | null;
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FlagRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/feature-flags?workspaceId=test-workspace')
      .then((r) => r.json())
      .then((data) => {
        setFlags(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  async function toggleFlag(id: string, enabled: boolean) {
    const res = await fetch('/api/admin/feature-flags', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, enabled }),
    });
    const updated = await res.json();
    setFlags((prev) => prev.map((f) => (f.id === id ? updated : f)));
  }

  if (loading) return <p>Loading flags…</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Feature Flags</h1>
      <div className="space-y-3">
        {flags.map((flag) => (
          <div
            key={flag.id}
            className="flex items-center justify-between rounded-xl border bg-card p-4"
            data-testid={`flag-${flag.key}`}
          >
            <div>
              <p className="font-medium">{flag.key}</p>
              {flag.description && (
                <p className="text-sm text-muted-foreground">{flag.description}</p>
              )}
            </div>
            <button
              role="switch"
              aria-checked={flag.enabled}
              aria-label={`Toggle ${flag.key}`}
              onClick={() => toggleFlag(flag.id, !flag.enabled)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                flag.enabled ? 'bg-brand-500' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  flag.enabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
