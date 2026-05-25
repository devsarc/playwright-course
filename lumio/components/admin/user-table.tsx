'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  _count: { memberships: number };
}

interface UserTableProps {
  initialUsers: UserRow[];
  total: number;
}

export function UserTable({ initialUsers, total }: UserTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('');
  const [sortField, setSortField] = useState<'email' | 'name' | 'createdAt'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(filter.toLowerCase()) ||
      (u.name?.toLowerCase() ?? '').includes(filter.toLowerCase()),
  );

  function toggleSort(field: 'email' | 'name' | 'createdAt') {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortField] ?? '';
    const bv = b[sortField] ?? '';
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  async function handleBulkDelete() {
    if (!confirm(`Delete ${selected.size} user(s)?`)) return;

    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds: Array.from(selected) }),
    });

    if (res.ok) {
      setUsers((prev) => prev.filter((u) => !selected.has(u.id)));
      setSelected(new Set());
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <Input
          placeholder="Filter by name or email…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter users"
          className="max-w-xs"
        />
        {selected.size > 0 && (
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            Delete {selected.size} selected
          </Button>
        )}
      </div>

      <p className="mb-2 text-sm text-muted-foreground">
        Showing {sorted.length} of {total} users
      </p>

      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm" aria-label="Users table">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  aria-label="Select all users"
                  checked={selected.size === sorted.length && sorted.length > 0}
                  onChange={(e) =>
                    setSelected(e.target.checked ? new Set(sorted.map((u) => u.id)) : new Set())
                  }
                />
              </th>
              {(['email', 'name', 'createdAt'] as const).map((field) => (
                <th
                  key={field}
                  className="cursor-pointer p-3 text-left font-medium hover:bg-muted"
                  onClick={() => toggleSort(field)}
                  aria-sort={
                    sortField === field
                      ? sortDir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  {field === 'createdAt' ? 'Joined' : field.charAt(0).toUpperCase() + field.slice(1)}
                  {sortField === field && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                </th>
              ))}
              <th className="p-3 text-left font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((user) => (
              <tr key={user.id} className="border-t hover:bg-muted/30">
                <td className="p-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${user.email}`}
                    checked={selected.has(user.id)}
                    onChange={(e) => {
                      const next = new Set(selected);
                      e.target.checked ? next.add(user.id) : next.delete(user.id);
                      setSelected(next);
                    }}
                  />
                </td>
                <td className="p-3">{user.email}</td>
                <td className="p-3 text-muted-foreground">{user.name ?? '—'}</td>
                <td className="p-3 text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      user.role === 'ADMIN'
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
