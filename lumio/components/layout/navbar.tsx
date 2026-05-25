'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/docs', label: 'Docs' },
  { href: '/blog', label: 'Blog' },
];

interface NavbarProps {
  session?: { user?: { name?: string | null } } | null;
}

export function Navbar({ session }: NavbarProps = {}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggedIn = !!session?.user;

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur dark:bg-gray-900/95">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
      >
        <Link href="/" className="text-xl font-bold text-brand-600">
          Lumio
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-6 md:flex" role="list">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="text-sm text-gray-600 hover:text-brand-600 dark:text-gray-300">
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <Link href="/dashboard"><Button size="sm">Go to Dashboard</Button></Link>
          ) : (
            <>
              <Link href="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
              <Link href="/signup"><Button size="sm">Get started free</Button></Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          aria-label="Open mobile menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          className="rounded-md p-2 hover:bg-muted md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="block h-0.5 w-5 bg-current" />
          <span className="mt-1 block h-0.5 w-5 bg-current" />
          <span className="mt-1 block h-0.5 w-5 bg-current" />
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div id="mobile-menu" className="border-t bg-white px-6 pb-4 md:hidden dark:bg-gray-900">
          <ul className="space-y-2 pt-2" role="list">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>
                  {label}
                </Link>
              </li>
            ))}
            {isLoggedIn ? (
              <li className="pt-2 border-t">
                <Link href="/dashboard"><Button className="w-full" size="sm">Go to Dashboard</Button></Link>
              </li>
            ) : (
              <>
                <li className="pt-2 border-t">
                  <Link href="/login" className="block py-2 text-sm">Sign in</Link>
                </li>
                <li>
                  <Link href="/signup"><Button className="w-full" size="sm">Get started free</Button></Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
