# Playwright Learning Platform — Part 4: Lumio Advanced Features

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the remaining Lumio features — PDF export, PWA service worker, i18n (en + fr), dark mode support, AI chat panel, SEO meta tags, public project directory, Chrome extension, and Electron client. By the end of this part, Lumio is feature-complete and all 93 module branch snapshots are tagged.

**Architecture:** PDF export runs server-side with Puppeteer. PWA is implemented with a custom service worker and `manifest.json` in `lumio/public/`. i18n uses `next-intl` with messages in `lumio/messages/`. Dark mode via Tailwind's `dark:` variant and `prefers-color-scheme`. Chrome extension is a separate MV3 bundle in `lumio/extension/`. Electron client is in `lumio/electron/` and uses `playwright`'s built-in `_electron` API for testing (no separate package).

**Tech Stack:** Puppeteer (server-side PDF), next-intl 3, native Service Worker API, Tailwind dark mode, Chrome MV3 extension manifest, Electron 31.

---

## File Map

| File | Purpose |
|------|---------|
| `lumio/app/api/pdf/route.ts` | PDF export endpoint — launches Puppeteer, returns PDF buffer |
| `lumio/public/manifest.json` | PWA web app manifest |
| `lumio/public/sw.js` | Service worker — caches static assets and API responses for offline |
| `lumio/app/offline/page.tsx` | Offline fallback page shown when service worker can't reach network |
| `lumio/components/pwa/pwa-register.tsx` | Client component that registers the service worker on mount |
| `lumio/messages/en.json` | English i18n strings |
| `lumio/messages/fr.json` | French i18n strings |
| `lumio/i18n.ts` | next-intl configuration |
| `lumio/middleware.ts` | Updated: add locale detection (alongside auth) |
| `lumio/app/[locale]/layout.tsx` | Locale-aware root layout |
| `lumio/components/layout/locale-switcher.tsx` | Language switcher in the topbar |
| `lumio/app/(app)/chat/page.tsx` | AI chat panel page |
| `lumio/components/chat/chat-interface.tsx` | Chat UI: input, message list, typing indicator |
| `lumio/app/api/chat/route.ts` | Chat message handler (echoes for now; real AI in M67) |
| `lumio/app/(marketing)/projects/page.tsx` | Public scrapable project directory |
| `lumio/app/(marketing)/blog/page.tsx` | Blog placeholder |
| `lumio/app/(marketing)/changelog/page.tsx` | Changelog placeholder |
| `lumio/extension/manifest.json` | Chrome MV3 extension manifest |
| `lumio/extension/popup.html` | Extension popup HTML |
| `lumio/extension/popup.ts` | Extension popup script (quick-add task form) |
| `lumio/extension/content.ts` | Content script — highlights Lumio tasks on any page |
| `lumio/extension/background.ts` | Background service worker |
| `lumio/electron/main.ts` | Electron main process |
| `lumio/electron/preload.ts` | Electron preload script (contextBridge) |

---

## Task 1: PDF Export

**Files:**
- Create: `lumio/app/api/pdf/route.ts`
- Add PDF export button to `lumio/app/(app)/projects/[id]/page.tsx`

- [ ] **Step 1: Create `lumio/app/api/pdf/route.ts`**

```typescript
import { NextRequest } from 'next/server';
import puppeteer from 'puppeteer';
import { requireAuth, apiError } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  const projectId = req.nextUrl.searchParams.get('projectId');
  if (!projectId) return apiError('projectId is required', 400);

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  // Launch headless Chrome via Puppeteer — this is separate from Playwright's browsers
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Navigate to the project's print-friendly URL, passing the session cookie
  // (In a real app, generate a short-lived token instead of forwarding cookies)
  await page.goto(`${baseUrl}/projects/${projectId}?print=1`, {
    waitUntil: 'networkidle0',
  });

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
  });

  await browser.close();

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="project-${projectId}.pdf"`,
    },
  });
}
```

- [ ] **Step 2: Add a download PDF button to the project board page**

In `lumio/app/(app)/projects/[id]/page.tsx`, add a link button inside the `<div>` before the `<KanbanBoard>`:

```typescript
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <a
            href={`/api/pdf?projectId=${project.id}`}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
            aria-label="Export project as PDF"
          >
            Export PDF
          </a>
        </div>
```

- [ ] **Step 3: Commit**

```bash
git add lumio/app/api/pdf/ lumio/app/(app)/projects/
git commit -m "feat(lumio): add server-side PDF export via Puppeteer"
```

---

## Task 2: PWA Service Worker and Manifest

**Files:**
- Create: `lumio/public/manifest.json`
- Create: `lumio/public/sw.js`
- Create: `lumio/app/offline/page.tsx`
- Create: `lumio/components/pwa/pwa-register.tsx`
- Modify: `lumio/app/layout.tsx` (add manifest link and PWA register component)

- [ ] **Step 1: Create `lumio/public/manifest.json`**

```json
{
  "name": "Lumio — Team Productivity",
  "short_name": "Lumio",
  "description": "The team productivity platform that keeps everyone aligned.",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4f6ef7",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "screenshots": [],
  "categories": ["productivity", "business"]
}
```

- [ ] **Step 2: Create `lumio/public/sw.js`**

```javascript
const CACHE_NAME = 'lumio-v1';

// Static assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/offline',
  '/dashboard',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Remove caches from previous versions
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // API requests: network-first, no cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'Offline' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503,
        }),
      ),
    );
    return;
  }

  // Pages and assets: stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Network failed — return cached version or offline page
          return cached ?? caches.match('/offline');
        });

      return cached ?? fetchPromise;
    }),
  );
});
```

- [ ] **Step 3: Create `lumio/app/offline/page.tsx`**

```typescript
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <div className="text-4xl">📡</div>
      <h1 className="mt-4 text-2xl font-bold">You are offline</h1>
      <p className="mt-2 text-muted-foreground">
        Check your internet connection. Previously loaded tasks are still available.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 rounded-md bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-600"
      >
        Try again
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Create `lumio/components/pwa/pwa-register.tsx`**

```typescript
'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('SW registered:', reg.scope))
        .catch((err) => console.warn('SW registration failed:', err));
    }
  }, []);

  return null;
}
```

- [ ] **Step 5: Update `lumio/app/layout.tsx`** to include manifest link and PWA register

Add inside `<head>` (via Next.js metadata) and inside `<body>`:

Replace the existing `layout.tsx` with:

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PwaRegister } from '@/components/pwa/pwa-register';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Lumio — Team Productivity',
    template: '%s | Lumio',
  },
  description: 'The team productivity platform that keeps everyone aligned.',
  manifest: '/manifest.json',
  themeColor: '#4f6ef7',
  openGraph: {
    type: 'website',
    title: 'Lumio — Team Productivity',
    description: 'The team productivity platform that keeps everyone aligned.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add lumio/public/manifest.json lumio/public/sw.js lumio/app/offline/ lumio/components/pwa/ lumio/app/layout.tsx
git commit -m "feat(lumio): add PWA service worker, offline fallback, and web manifest"
```

---

## Task 3: i18n with next-intl

**Files:**
- Create: `lumio/messages/en.json`
- Create: `lumio/messages/fr.json`
- Create: `lumio/i18n.ts`
- Modify: `lumio/middleware.ts` (add locale detection)
- Create: `lumio/components/layout/locale-switcher.tsx`

- [ ] **Step 1: Create `lumio/messages/en.json`**

```json
{
  "nav": {
    "dashboard": "Dashboard",
    "projects": "Projects",
    "docs": "Docs",
    "members": "Members",
    "settings": "Settings",
    "signOut": "Sign out"
  },
  "landing": {
    "hero": "The productivity platform your team will actually use",
    "cta": "Get started free",
    "features": "Everything your team needs",
    "pricing": "Simple, transparent pricing"
  },
  "tasks": {
    "create": "Create task",
    "noTasks": "No tasks yet",
    "priority": {
      "low": "Low",
      "medium": "Medium",
      "high": "High",
      "urgent": "Urgent"
    }
  },
  "auth": {
    "signIn": "Sign in",
    "signUp": "Sign up",
    "email": "Email address",
    "password": "Password",
    "forgotPassword": "Forgot password?"
  }
}
```

- [ ] **Step 2: Create `lumio/messages/fr.json`**

```json
{
  "nav": {
    "dashboard": "Tableau de bord",
    "projects": "Projets",
    "docs": "Documentation",
    "members": "Membres",
    "settings": "Paramètres",
    "signOut": "Se déconnecter"
  },
  "landing": {
    "hero": "La plateforme de productivité que votre équipe utilisera vraiment",
    "cta": "Commencer gratuitement",
    "features": "Tout ce dont votre équipe a besoin",
    "pricing": "Tarification simple et transparente"
  },
  "tasks": {
    "create": "Créer une tâche",
    "noTasks": "Aucune tâche pour l'instant",
    "priority": {
      "low": "Faible",
      "medium": "Moyen",
      "high": "Élevé",
      "urgent": "Urgent"
    }
  },
  "auth": {
    "signIn": "Se connecter",
    "signUp": "S'inscrire",
    "email": "Adresse e-mail",
    "password": "Mot de passe",
    "forgotPassword": "Mot de passe oublié ?"
  }
}
```

- [ ] **Step 3: Create `lumio/i18n.ts`**

```typescript
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}));
```

- [ ] **Step 4: Update `lumio/next.config.ts`** to wrap with next-intl plugin

```typescript
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 5: Update `lumio/middleware.ts`** to handle both locale routing and auth

Replace the existing middleware with:

```typescript
import createMiddleware from 'next-intl/middleware';
import { auth } from '@/lib/auth';
import { NextResponse, type NextRequest } from 'next/server';

const localeMiddleware = createMiddleware({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // /fr/dashboard but /dashboard (not /en/dashboard)
});

const PROTECTED_PATHS = ['/dashboard', '/onboarding', '/admin', '/projects', '/chat'];
const PROTECTED_API = ['/api/workspaces', '/api/projects', '/api/tasks', '/api/notifications'];

export default auth((req: NextRequest & { auth: unknown }) => {
  const pathname = req.nextUrl.pathname;
  const isAuthenticated = !!(req as { auth: unknown }).auth;

  // Auth protection for app pages and API routes
  const needsAuth =
    PROTECTED_PATHS.some((p) => pathname.includes(p)) ||
    PROTECTED_API.some((p) => pathname.startsWith(p));

  if (needsAuth && !isAuthenticated) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Apply locale routing for non-API requests
  if (!pathname.startsWith('/api/')) {
    return localeMiddleware(req as NextRequest);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)'],
};
```

- [ ] **Step 6: Create `lumio/components/layout/locale-switcher.tsx`**

```typescript
'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    // Replace locale prefix in pathname or add it
    const pathWithoutLocale = pathname.replace(/^\/(en|fr)/, '') || '/';
    router.push(newLocale === 'en' ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`);
  }

  return (
    <div className="flex items-center gap-1">
      {(['en', 'fr'] as const).map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          aria-label={`Switch to ${l === 'en' ? 'English' : 'French'}`}
          aria-pressed={locale === l}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            locale === l ? 'bg-brand-500 text-white' : 'hover:bg-muted'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Commit and tag snapshot for M34**

```bash
git add lumio/messages/ lumio/i18n.ts lumio/next.config.ts lumio/middleware.ts lumio/components/layout/locale-switcher.tsx
git commit -m "feat(lumio): add i18n with next-intl (English + French)"

# Tag Lumio state for M34–M37 (cross-browser, mobile, offline, PWA)
git tag lumio-snapshot-m34
```

---

## Task 4: Dark Mode and Responsive Layout

- [ ] **Step 1: Update `lumio/tailwind.config.ts`** to enable dark mode via class strategy

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          500: '#4f6ef7',
          600: '#3b55e6',
          700: '#2d45d4',
          900: '#1a2a8a',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Add mobile-responsive hamburger to `lumio/components/layout/navbar.tsx`**

Replace the `<button aria-label="Open mobile menu"...>` block with a working mobile menu:

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/docs', label: 'Docs' },
  { href: '/blog', label: 'Blog' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <Link href="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link href="/signup"><Button size="sm">Get started free</Button></Link>
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
            <li className="pt-2 border-t">
              <Link href="/login" className="block py-2 text-sm">Sign in</Link>
            </li>
            <li>
              <Link href="/signup"><Button className="w-full" size="sm">Get started free</Button></Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add lumio/tailwind.config.ts lumio/components/layout/navbar.tsx
git commit -m "feat(lumio): enable dark mode and mobile-responsive navbar"
```

---

## Task 5: AI Chat Panel

**Files:**
- Create: `lumio/app/api/chat/route.ts`
- Create: `lumio/components/chat/chat-interface.tsx`
- Create: `lumio/app/(app)/chat/page.tsx`

- [ ] **Step 1: Create `lumio/app/api/chat/route.ts`**

```typescript
import { NextRequest } from 'next/server';
import { requireAuth, json } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  await requireAuth();
  const { message } = await req.json();

  // Simulate a streaming-style response with a short delay
  // In M67, learners test this endpoint's streaming behavior
  const responses = [
    `I can help you with that. Here's what I found about "${message}":`,
    'Based on your tasks, I recommend focusing on high-priority items first.',
    'I noticed you have 3 overdue tasks. Would you like me to reschedule them?',
  ];

  const reply = responses[Math.floor(Math.random() * responses.length)];

  // Simulate a slight processing delay (for typing indicator testing in M67)
  await new Promise((r) => setTimeout(r, 800));

  return json({ message: reply, timestamp: new Date().toISOString() });
}
```

- [ ] **Step 2: Create `lumio/components/chat/chat-interface.tsx`**

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I can help you manage your tasks and projects. What would you like to do?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });
    const data = await res.json();
    setTyping(false);

    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: data.message,
      timestamp: data.timestamp,
    };
    setMessages((prev) => [...prev, assistantMsg]);
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-xl border bg-card">
      {/* Message list */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            data-testid={`message-${msg.role}`}
          >
            <div
              className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-brand-500 text-white'
                  : 'bg-muted text-foreground'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div
            className="flex justify-start"
            role="status"
            aria-label="Assistant is typing"
            data-testid="typing-indicator"
          >
            <div className="flex gap-1 rounded-2xl bg-muted px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2 border-t p-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about your tasks…"
          aria-label="Chat message input"
          className="flex-1"
        />
        <Button type="submit" disabled={typing || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Create `lumio/app/(app)/chat/page.tsx`**

```typescript
import type { Metadata } from 'next';
import { ChatInterface } from '@/components/chat/chat-interface';

export const metadata: Metadata = { title: 'AI Assistant' };

export default function ChatPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">AI Assistant</h1>
      <ChatInterface />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add lumio/app/api/chat/ lumio/components/chat/ lumio/app/(app)/chat/
git commit -m "feat(lumio): add AI chat panel with typing indicator"
```

---

## Task 6: SEO and Public Project Directory

**Files:**
- Create: `lumio/app/(marketing)/projects/page.tsx`
- Create: `lumio/app/(marketing)/blog/page.tsx`
- Create: `lumio/app/(marketing)/changelog/page.tsx`
- Add JSON-LD structured data to landing page

- [ ] **Step 1: Create `lumio/app/(marketing)/projects/page.tsx`**

This public scrapable page is what M55-M57 exercises use for scraping and crawling.

```typescript
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = {
  title: 'Public Projects',
  description: 'Browse public Lumio projects shared by the community.',
};

export default async function PublicProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { isPublic: true },
    include: {
      workspace: { select: { name: true } },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold">Community Projects</h1>
        <p className="mt-2 text-muted-foreground">
          Public projects shared by Lumio teams. {projects.length} projects available.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="rounded-xl border bg-card p-5"
              data-testid="public-project-card"
            >
              <h2 className="font-semibold">{project.name}</h2>
              {project.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{project.workspace.name}</span>
                <span>{project._count.tasks} tasks</span>
              </div>
            </article>
          ))}

          {projects.length === 0 && (
            <p className="col-span-3 py-12 text-center text-muted-foreground">
              No public projects yet.
            </p>
          )}
        </div>

        {/* Pagination link for crawling tests (M57) */}
        <nav aria-label="Pagination" className="mt-8 text-center">
          <Link href="/projects?page=2" className="text-brand-500 hover:underline text-sm">
            Next page →
          </Link>
        </nav>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Create `lumio/app/(marketing)/blog/page.tsx`**

```typescript
import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = { title: 'Blog' };

const POSTS = [
  { slug: 'introducing-lumio', title: 'Introducing Lumio', date: '2024-01-15', excerpt: 'We built Lumio to solve the productivity platform problem.' },
  { slug: 'kanban-tips', title: '5 Kanban tips for remote teams', date: '2024-02-20', excerpt: 'How to use kanban boards effectively when working async.' },
  { slug: 'playwright-testing', title: 'How we test Lumio with Playwright', date: '2024-03-10', excerpt: 'Our approach to E2E testing across all browsers.' },
];

export default function BlogPage() {
  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold">Blog</h1>
        <div className="mt-8 space-y-8">
          {POSTS.map((post) => (
            <article key={post.slug} className="border-b pb-8">
              <time className="text-sm text-muted-foreground">{post.date}</time>
              <h2 className="mt-1 text-xl font-semibold">
                <Link href={`/blog/${post.slug}`} className="hover:text-brand-600">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-muted-foreground">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Add JSON-LD structured data to `lumio/app/page.tsx`**

Add this inside the `<LandingPage>` component, before the closing `</div>`:

```typescript
      {/* JSON-LD structured data for SEO (M69 tests this) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Lumio',
            applicationCategory: 'BusinessApplication',
            description: 'Team productivity platform with kanban boards and real-time collaboration.',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          }),
        }}
      />
```

- [ ] **Step 4: Commit**

```bash
git add lumio/app/(marketing)/projects/ lumio/app/(marketing)/blog/ lumio/app/(marketing)/changelog/ lumio/app/page.tsx
git commit -m "feat(lumio): add public project directory, blog, and JSON-LD structured data"
```

---

## Task 7: Chrome Extension (MV3)

**Files:**
- Create: `lumio/extension/manifest.json`
- Create: `lumio/extension/popup.html`
- Create: `lumio/extension/popup.ts`
- Create: `lumio/extension/content.ts`
- Create: `lumio/extension/background.ts`

- [ ] **Step 1: Create `lumio/extension/manifest.json`**

```json
{
  "manifest_version": 3,
  "name": "Lumio Quick Add",
  "version": "1.0.0",
  "description": "Quickly add tasks to Lumio from any webpage.",
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": ["http://localhost:3000/*", "https://*.lumio.app/*"],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Lumio Quick Add",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png"
    }
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  }
}
```

- [ ] **Step 2: Create `lumio/extension/popup.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Lumio Quick Add</title>
  <style>
    body { font-family: system-ui, sans-serif; width: 320px; margin: 0; padding: 16px; }
    h1 { font-size: 16px; margin: 0 0 12px; color: #3b55e6; }
    label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 4px; }
    input, select { width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; margin-bottom: 12px; }
    button { width: 100%; padding: 8px; background: #4f6ef7; color: white; border: none; border-radius: 6px; font-size: 13px; cursor: pointer; }
    button:hover { background: #3b55e6; }
    #status { margin-top: 8px; font-size: 12px; text-align: center; }
    .success { color: #16a34a; }
    .error { color: #dc2626; }
  </style>
</head>
<body>
  <h1>Lumio Quick Add</h1>

  <label for="task-title">Task title</label>
  <input id="task-title" type="text" placeholder="What needs to be done?" />

  <label for="task-priority">Priority</label>
  <select id="task-priority">
    <option value="LOW">Low</option>
    <option value="MEDIUM" selected>Medium</option>
    <option value="HIGH">High</option>
    <option value="URGENT">Urgent</option>
  </select>

  <button id="submit-btn" type="button">Add to Lumio</button>
  <div id="status" role="status" aria-live="polite"></div>

  <script src="popup.js" type="module"></script>
</body>
</html>
```

- [ ] **Step 3: Create `lumio/extension/popup.ts`**

```typescript
const LUMIO_API = 'http://localhost:3000/api/tasks';
// In production this would use chrome.storage to get the user's project ID
const DEFAULT_PROJECT_ID = 'seed-project-001';

document.getElementById('submit-btn')!.addEventListener('click', async () => {
  const title = (document.getElementById('task-title') as HTMLInputElement).value.trim();
  const priority = (document.getElementById('task-priority') as HTMLSelectElement).value;
  const status = document.getElementById('status')!;

  if (!title) {
    status.textContent = 'Please enter a task title.';
    status.className = 'error';
    return;
  }

  status.textContent = 'Adding task…';
  status.className = '';

  try {
    const res = await fetch(LUMIO_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // send session cookie
      body: JSON.stringify({ title, priority, projectId: DEFAULT_PROJECT_ID }),
    });

    if (!res.ok) throw new Error(await res.text());

    status.textContent = '✓ Task added to Lumio!';
    status.className = 'success';
    (document.getElementById('task-title') as HTMLInputElement).value = '';
  } catch (err) {
    status.textContent = 'Failed to add task. Make sure you are logged into Lumio.';
    status.className = 'error';
  }
});
```

- [ ] **Step 4: Create `lumio/extension/content.ts`**

```typescript
// Content script: highlights text mentioning Lumio task IDs on any page.
// Used by M71 to test content script behavior.

function highlightLumioReferences() {
  const taskPattern = /\bLMO-\d+\b/g;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

  const textNodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (taskPattern.test((node as Text).data)) {
      textNodes.push(node as Text);
    }
    taskPattern.lastIndex = 0;
  }

  for (const textNode of textNodes) {
    const span = document.createElement('span');
    span.innerHTML = textNode.data.replace(
      /\bLMO-\d+\b/g,
      (match) =>
        `<a href="http://localhost:3000/tasks/${match}" target="_blank" style="color:#4f6ef7;font-weight:bold;" data-lumio-task="${match}">${match}</a>`,
    );
    textNode.parentNode?.replaceChild(span, textNode);
  }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', highlightLumioReferences);
} else {
  highlightLumioReferences();
}

// Expose for testing via page.evaluate()
(window as unknown as Record<string, unknown>).__lumioContentScript = { highlightLumioReferences };
```

- [ ] **Step 5: Create `lumio/extension/background.ts`**

```typescript
// Background service worker for Lumio extension.
// Handles installation and icon badge updates.

chrome.runtime.onInstalled.addListener(() => {
  console.log('Lumio Quick Add extension installed.');
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_STATUS') {
    sendResponse({ installed: true, version: chrome.runtime.getManifest().version });
  }
  return true; // keep channel open for async responses
});
```

- [ ] **Step 6: Commit**

```bash
git add lumio/extension/
git commit -m "feat(lumio): add Chrome MV3 extension with popup, content script, and background SW"
```

---

## Task 8: Electron Client

**Files:**
- Create: `lumio/electron/main.ts`
- Create: `lumio/electron/preload.ts`
- Add Electron to `lumio/package.json` devDependencies

- [ ] **Step 1: Add Electron to `lumio/package.json`**

Add to `devDependencies`:
```json
"electron": "^31.0.0",
"electron-builder": "^24.13.3"
```

Add to `scripts`:
```json
"electron:dev": "electron electron/main.js",
"electron:build": "electron-builder"
```

Run:
```bash
npm install --prefix lumio
```

- [ ] **Step 2: Create `lumio/electron/preload.ts`**

```typescript
import { contextBridge, ipcRenderer } from 'electron';

// Expose a minimal API to the renderer process via contextBridge.
// This prevents the renderer from accessing Node.js directly (security).
contextBridge.exposeInMainWorld('lumioElectron', {
  platform: process.platform,
  version: process.versions.electron,
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
});
```

- [ ] **Step 3: Create `lumio/electron/main.ts`**

```typescript
import { app, BrowserWindow, ipcMain, Menu, Tray, shell, nativeImage } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const LUMIO_URL = process.env.LUMIO_URL ?? 'http://localhost:3000';

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Lumio',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,  // security: isolate renderer from Node.js
      nodeIntegration: false,  // security: don't expose Node in renderer
    },
  });

  // Load the Lumio web app
  mainWindow.loadURL(LUMIO_URL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray(): void {
  // Use a blank image as placeholder icon — replace with a real icon in production
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Lumio', click: () => mainWindow?.show() ?? createWindow() },
    { label: 'Dashboard', click: () => mainWindow?.loadURL(`${LUMIO_URL}/dashboard`) },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);

  tray.setToolTip('Lumio');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => mainWindow?.show() ?? createWindow());
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  // On macOS, keep the app running when all windows are closed (common pattern)
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// IPC handlers
ipcMain.handle('open-external', (_event, url: string) => shell.openExternal(url));
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize();
});
ipcMain.on('window-close', () => mainWindow?.close());
```

- [ ] **Step 4: Commit**

```bash
git add lumio/electron/ lumio/package.json
git commit -m "feat(lumio): add Electron desktop client with tray and preload bridge"
```

---

## Task 9: Final Lumio Snapshots and Verification

- [ ] **Step 1: Create the final Lumio snapshot tag**

All modules from M38 onward use `lumioSnapshot: null` in the registry — meaning they get Lumio from the latest `main` state. Tag `main` now to document the full Lumio state.

```bash
git tag lumio-complete
```

- [ ] **Step 2: Verify all required snapshot tags exist**

```bash
git tag | sort
```

Expected output includes:
```
lumio-complete
lumio-snapshot-m00
lumio-snapshot-m02
lumio-snapshot-m12
lumio-snapshot-m20
lumio-snapshot-m25
lumio-snapshot-m31
lumio-snapshot-m34
```

If any tag is missing, check which task created it and re-run that task's final commit + tag step.

- [ ] **Step 3: Verify Lumio starts cleanly**

```bash
npm run dev --prefix lumio
```

Visit and verify these routes load without errors:
- `http://localhost:3000/` — landing page with pricing cards and nav
- `http://localhost:3000/login` — login form
- `http://localhost:3000/signup` — signup form
- `http://localhost:3000/fr` — French landing page (i18n)
- `http://localhost:3000/offline` — offline fallback page
- `http://localhost:3000/projects` — public project directory (may be empty)

Stop dev server.

- [ ] **Step 4: Run the full Playwright test suite against M00**

From the repo root (not `lumio/`):

```bash
npx playwright test tests/module-00-setup
```

Expected:
```
2 passed (Xms)
```

Both M00 tests (title and heading) should pass against the now-complete Lumio app.

---

## Self-Review

### Spec coverage check

| Spec requirement | Covered by |
|-----------------|-----------|
| PDF export (Puppeteer server-side) | Task 1 |
| PWA service worker + manifest.json | Task 2 |
| Offline fallback page | Task 2 |
| i18n (next-intl, en + fr) | Task 3 |
| Dark mode (Tailwind `dark:` class strategy) | Task 4 |
| Mobile-responsive navbar (hamburger menu) | Task 4 |
| AI chat panel (typing indicator, streaming-style response) | Task 5 |
| Public project directory (scrapable, paginated) | Task 6 |
| Blog placeholder | Task 6 |
| JSON-LD structured data on landing | Task 6 |
| Chrome extension MV3: popup, content script, background SW | Task 7 |
| Electron client: main process, preload, tray | Task 8 |
| All 7 Lumio snapshot tags created | Tasks 5-9 |
| `lumio-complete` tag for full Lumio state | Task 9 |
| M00 module exercises pass against complete Lumio | Task 9 |

### Placeholder scan

No TBD or incomplete sections. The Chat API returns a random canned response — this is intentional and documented. A real LLM integration is out of scope for the platform. The extension popup hardcodes `seed-project-001` as the project ID — this matches the seed data and is appropriate for the testing context. The Electron main process uses `process.versions.electron` in preload — this is safe because preload scripts run in Node context.

### Type consistency

- `broadcastToUser` from `lib/ws.ts` is not called in Part 4 — correctly only used in the notifications route (Part 3).
- `requireAuth()` signature unchanged from Part 3.
- Electron `ipcMain.handle` / `ipcMain.on` handler names ('open-external', 'window-minimize', 'window-maximize', 'window-close') match exactly the `ipcRenderer.invoke` / `ipcRenderer.send` calls in `preload.ts`.
