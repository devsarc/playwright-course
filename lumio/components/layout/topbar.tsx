'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

interface TopbarProps {
  notificationCount?: number;
}

export function Topbar({ notificationCount = 0 }: TopbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <h1 className="sr-only">Lumio App</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ''}`}
          className="relative rounded-md p-2 hover:bg-muted"
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true" className="text-lg">🔔</span>
          {notificationCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-xs text-white"
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          Sign out
        </Button>
      </div>

      {open && (
        <div
          role="region"
          aria-label="Notifications"
          className="absolute right-6 top-14 z-50 w-80 rounded-xl border bg-card shadow-lg"
        >
          <div className="border-b p-4">
            <h2 className="font-semibold">Notifications</h2>
          </div>
          <div className="p-4 text-sm text-muted-foreground">
            No new notifications
          </div>
        </div>
      )}
    </header>
  );
}
