'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/projects', label: 'Projects', icon: '📋' },
  { href: '/docs', label: 'Docs', icon: '📝' },
  { href: '/members', label: 'Members', icon: '👥' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside aria-label="App navigation" className="flex h-screen w-60 flex-col border-r bg-card">
      <div className="p-6">
        <Link href="/dashboard" className="text-lg font-bold text-brand-600">
          Lumio
        </Link>
      </div>

      <nav className="flex-1 px-3">
        <ul role="list" className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-brand-50 font-medium text-brand-700'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <span aria-hidden="true">{icon}</span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t p-4">
        <Link
          href="/admin"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          <span aria-hidden="true">🛡️</span>
          Admin
        </Link>
      </div>
    </aside>
  );
}
