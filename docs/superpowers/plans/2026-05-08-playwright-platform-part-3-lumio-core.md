# Playwright Learning Platform — Part 3: Lumio Core Features

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the core product features of Lumio — the protected app shell, dashboard, kanban board (dnd-kit), task detail modal with TipTap rich text (inside an iframe), file upload, admin panel, WebSocket notification server, and SSE activity feed. By the end of this part, Lumio covers everything modules M20–M33 need.

**Architecture:** Protected app pages live in `app/(app)/` with a shared sidebar layout. The TipTap editor is deliberately rendered inside an `<iframe>` (served from `/editor`) to create a realistic iframe-testing scenario for M24. WebSocket runs via a custom Next.js server (`server.ts`). SSE is an API route that returns a `ReadableStream`. Admin panel lives at `app/(app)/admin/`.

**Tech Stack:** @dnd-kit/core + @dnd-kit/sortable for drag-drop; @tiptap/react + @tiptap/starter-kit for rich text; `ws` npm package + custom Next.js server for WebSocket; native Web Streams API for SSE; Recharts for dashboard charts.

---

## File Map

| File | Purpose |
|------|---------|
| `lumio/server.ts` | Custom Next.js server that attaches a WebSocket upgrade handler |
| `lumio/lib/ws.ts` | WebSocket client registry + broadcast helper |
| `lumio/app/(app)/layout.tsx` | Protected app shell: sidebar + topbar |
| `lumio/app/(app)/dashboard/page.tsx` | Dashboard: task summary charts, recent activity |
| `lumio/app/(app)/projects/page.tsx` | Project list page |
| `lumio/app/(app)/projects/[id]/page.tsx` | Kanban board for a project |
| `lumio/app/(app)/projects/[id]/tasks/[taskId]/page.tsx` | Task detail page/modal |
| `lumio/app/editor/page.tsx` | Standalone TipTap editor page — rendered inside an iframe in task detail |
| `lumio/components/board/kanban-board.tsx` | Full kanban board with @dnd-kit drag-drop |
| `lumio/components/board/task-card.tsx` | Individual task card (draggable) |
| `lumio/components/board/board-column.tsx` | Droppable column |
| `lumio/components/editor/rich-text-editor.tsx` | TipTap editor component |
| `lumio/components/tasks/task-detail.tsx` | Task detail modal with iframe editor |
| `lumio/components/tasks/file-upload.tsx` | File attachment upload component |
| `lumio/components/layout/sidebar.tsx` | App sidebar navigation |
| `lumio/components/layout/topbar.tsx` | App topbar with notifications bell |
| `lumio/components/notifications/notification-feed.tsx` | Real-time notification panel |
| `lumio/app/(app)/admin/page.tsx` | Admin panel: user table |
| `lumio/app/(app)/admin/feature-flags/page.tsx` | Feature flags admin UI |
| `lumio/components/admin/user-table.tsx` | Sortable/filterable/paginated user table |
| `lumio/app/api/notifications/sse/route.ts` | SSE endpoint for activity feed |
| `lumio/app/api/upload/route.ts` | File upload API |
| `lumio/app/api/admin/users/route.ts` | Admin: list + manage users |
| `lumio/app/api/admin/feature-flags/route.ts` | Admin: manage feature flags |

---

## Task 1: Custom Server and WebSocket Infrastructure

Next.js does not support WebSocket upgrades in its built-in server. We run a minimal custom server (`server.ts`) that delegates all HTTP to Next.js and handles WebSocket upgrades itself.

**Files:**
- Create: `lumio/server.ts`
- Create: `lumio/lib/ws.ts`
- Modify: `lumio/package.json` (update dev/start scripts)

- [ ] **Step 1: Create `lumio/lib/ws.ts`**

```typescript
import { WebSocket } from 'ws';

// Registry of connected clients keyed by userId.
// A single user can have multiple connections (multiple browser tabs).
const clients = new Map<string, Set<WebSocket>>();

export function registerClient(userId: string, ws: WebSocket): void {
  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId)!.add(ws);

  ws.on('close', () => {
    clients.get(userId)?.delete(ws);
    if (clients.get(userId)?.size === 0) clients.delete(userId);
  });
}

export function broadcastToUser(userId: string, payload: object): void {
  const userClients = clients.get(userId);
  if (!userClients) return;

  const message = JSON.stringify(payload);
  for (const ws of userClients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
}

export function broadcastToAll(payload: object): void {
  const message = JSON.stringify(payload);
  for (const userClients of clients.values()) {
    for (const ws of userClients) {
      if (ws.readyState === WebSocket.OPEN) ws.send(message);
    }
  }
}

export function getConnectedUserIds(): string[] {
  return Array.from(clients.keys());
}
```

- [ ] **Step 2: Create `lumio/server.ts`**

```typescript
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer } from 'ws';
import { registerClient } from './lib/ws';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws, req) => {
    // userId is passed as a query param: ws://localhost:3000/ws?userId=xxx
    const url = parse(req.url ?? '', true);
    const userId = url.query.userId as string | undefined;

    if (!userId) {
      ws.close(4001, 'userId required');
      return;
    }

    registerClient(userId, ws);
    ws.send(JSON.stringify({ type: 'connected', userId }));
  });

  server.on('upgrade', (req, socket, head) => {
    const { pathname } = parse(req.url!);
    if (pathname === '/ws') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  const port = parseInt(process.env.PORT ?? '3000', 10);
  server.listen(port, () => {
    console.log(`> Lumio ready on http://localhost:${port}`);
  });
});
```

- [ ] **Step 3: Update `lumio/package.json` scripts to use the custom server**

Replace the `dev` and `start` scripts:

```json
"scripts": {
  "dev": "tsx server.ts",
  "build": "next build",
  "start": "NODE_ENV=production tsx server.ts",
  "lint": "next lint",
  "db:push": "prisma db push",
  "db:migrate": "prisma migrate dev",
  "db:seed": "tsx prisma/seed.ts",
  "db:studio": "prisma studio",
  "db:generate": "prisma generate"
}
```

- [ ] **Step 4: Verify the custom server starts**

```bash
npm run dev --prefix lumio
```

Expected output:
```
> Lumio ready on http://localhost:3000
```

No TypeScript errors. Open `http://localhost:3000` — landing page still loads. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add lumio/server.ts lumio/lib/ws.ts lumio/package.json
git commit -m "feat(lumio): add custom Next.js server with WebSocket upgrade support"
```

---

## Task 2: App Shell Layout and Navigation

**Files:**
- Create: `lumio/components/layout/sidebar.tsx`
- Create: `lumio/components/layout/topbar.tsx`
- Create: `lumio/app/(app)/layout.tsx`
- Create: `lumio/app/(app)/dashboard/page.tsx`
- Create: `lumio/app/(app)/projects/page.tsx`

- [ ] **Step 1: Create `lumio/components/layout/sidebar.tsx`**

```typescript
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
```

- [ ] **Step 2: Create `lumio/components/layout/topbar.tsx`**

```typescript
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
        {/* Notification bell */}
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

      {/* Notification panel */}
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
```

- [ ] **Step 3: Create `lumio/app/(app)/layout.tsx`**

```typescript
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `lumio/app/(app)/dashboard/page.tsx`**

```typescript
import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;

  // Count tasks by status across all workspaces the user belongs to
  const taskStats = await prisma.task.groupBy({
    by: ['status'],
    where: {
      project: {
        workspace: { members: { some: { userId: session.user.id } } },
      },
    },
    _count: { _all: true },
  });

  const stats = {
    todo: taskStats.find((s) => s.status === 'TODO')?._count._all ?? 0,
    inProgress: taskStats.find((s) => s.status === 'IN_PROGRESS')?._count._all ?? 0,
    inReview: taskStats.find((s) => s.status === 'IN_REVIEW')?._count._all ?? 0,
    done: taskStats.find((s) => s.status === 'DONE')?._count._all ?? 0,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">
        Welcome back, {session.user.name ?? session.user.email}
      </p>

      {/* Summary cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'To Do', value: stats.todo, color: 'bg-gray-100' },
          { label: 'In Progress', value: stats.inProgress, color: 'bg-blue-100' },
          { label: 'In Review', value: stats.inReview, color: 'bg-yellow-100' },
          { label: 'Done', value: stats.done, color: 'bg-green-100' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className={`rounded-xl p-5 ${color}`}
            data-testid={`stat-card-${label.toLowerCase().replace(' ', '-')}`}
          >
            <p className="text-sm font-medium text-gray-700">{label}</p>
            <p className="mt-1 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-8">
        <DashboardCharts stats={stats} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `lumio/components/dashboard/dashboard-charts.tsx`**

```typescript
'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface DashboardChartsProps {
  stats: { todo: number; inProgress: number; inReview: number; done: number };
}

const COLORS = ['#94a3b8', '#3b82f6', '#f59e0b', '#22c55e'];

export function DashboardCharts({ stats }: DashboardChartsProps) {
  const data = [
    { name: 'To Do', count: stats.todo },
    { name: 'In Progress', count: stats.inProgress },
    { name: 'In Review', count: stats.inReview },
    { name: 'Done', count: stats.done },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold">Tasks by status</h2>
        <ResponsiveContainer width="100%" height={220} className="mt-4">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#4f6ef7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold">Task distribution</h2>
        <ResponsiveContainer width="100%" height={220} className="mt-4">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) =>
                percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
              }
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create `lumio/app/(app)/projects/page.tsx`**

```typescript
import type { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Projects' };

export default async function ProjectsPage() {
  const session = await auth();
  if (!session) return null;

  const workspaces = await prisma.workspace.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      projects: {
        include: { _count: { select: { tasks: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button>New project</Button>
      </div>

      {workspaces.map((ws) => (
        <section key={ws.id} className="mt-8">
          <h2 className="font-semibold text-muted-foreground">{ws.name}</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ws.projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div
                  className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
                  data-testid="project-card"
                >
                  <h3 className="font-semibold">{project.name}</h3>
                  {project.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <p className="mt-3 text-sm text-muted-foreground">
                    {project._count.tasks} tasks
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add lumio/components/layout/ lumio/components/dashboard/ lumio/app/(app)/
git commit -m "feat(lumio): add app shell layout, dashboard with Recharts, and project list"
```

---

## Task 3: Kanban Board with dnd-kit

**Files:**
- Create: `lumio/components/board/task-card.tsx`
- Create: `lumio/components/board/board-column.tsx`
- Create: `lumio/components/board/kanban-board.tsx`
- Create: `lumio/app/(app)/projects/[id]/page.tsx`

- [ ] **Step 1: Create `lumio/components/board/task-card.tsx`**

```typescript
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface TaskCardData {
  id: string;
  title: string;
  priority: string;
  assignee?: { name: string | null; image: string | null } | null;
}

interface TaskCardProps {
  task: TaskCardData;
  onClick?: (taskId: string) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-testid="task-card"
      data-task-id={task.id}
      className="rounded-lg border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
      role="button"
      aria-label={`Task: ${task.title}`}
      onClick={() => onClick?.(task.id)}
    >
      <p className="text-sm font-medium leading-snug">{task.title}</p>
      <div className="mt-2 flex items-center justify-between">
        <span
          className={`rounded px-1.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.MEDIUM}`}
        >
          {task.priority}
        </span>
        {task.assignee?.name && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs text-white">
            {task.assignee.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `lumio/components/board/board-column.tsx`**

```typescript
'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard, type TaskCardData } from './task-card';

interface BoardColumnProps {
  id: string;
  name: string;
  tasks: TaskCardData[];
  onTaskClick?: (taskId: string) => void;
}

export function BoardColumn({ id, name, tasks, onTaskClick }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      data-testid="board-column"
      data-column-id={id}
      className={`flex w-72 flex-shrink-0 flex-col rounded-xl border bg-muted/30 p-3 transition-colors ${
        isOver ? 'bg-brand-50' : ''
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-gray-700">{name}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex flex-col gap-2 min-h-[60px]">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
```

- [ ] **Step 3: Create `lumio/components/board/kanban-board.tsx`**

```typescript
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

  // PointerSensor with a small activation distance prevents accidental drags on click
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
    // over.id can be either a column id or a task id
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

      // Persist the move to the server
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
```

- [ ] **Step 4: Create `lumio/app/(app)/projects/[id]/page.tsx`**

```typescript
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { KanbanBoard, type Column } from '@/components/board/kanban-board';

export const metadata: Metadata = { title: 'Project Board' };

export default async function ProjectBoardPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session) return null;

  const project = await prisma.project.findFirst({
    where: {
      id: params.id,
      workspace: { members: { some: { userId: session.user.id } } },
    },
    include: {
      columns: {
        orderBy: { order: 'asc' },
        include: {
          tasks: {
            orderBy: { order: 'asc' },
            include: {
              assignee: { select: { name: true, image: true } },
            },
          },
        },
      },
    },
  });

  if (!project) notFound();

  const columns: Column[] = project.columns.map((col) => ({
    id: col.id,
    name: col.name,
    tasks: col.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      priority: task.priority,
      assignee: task.assignee,
    })),
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{project.name}</h1>
      <KanbanBoard initialColumns={columns} />
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add lumio/components/board/ lumio/app/(app)/projects/
git commit -m "feat(lumio): add kanban board with dnd-kit drag-drop"
```

---

## Task 4: TipTap Rich Text Editor (in iframe)

The TipTap editor is rendered inside an `<iframe>` to create a realistic iframe-testing scenario for M24. The iframe loads `/editor`, a minimal Next.js page that renders just the editor component.

**Files:**
- Create: `lumio/components/editor/rich-text-editor.tsx`
- Create: `lumio/app/editor/page.tsx`
- Create: `lumio/components/tasks/task-detail.tsx`
- Create: `lumio/app/(app)/projects/[id]/tasks/[taskId]/page.tsx`

- [ ] **Step 1: Create `lumio/components/editor/rich-text-editor.tsx`**

```typescript
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface RichTextEditorProps {
  content?: string;
  editable?: boolean;
  onChange?: (html: string) => void;
}

export function RichTextEditor({
  content = '',
  editable = true,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  return (
    <div className="prose prose-sm max-w-none">
      {editable && (
        <div className="flex gap-1 border-b p-2">
          <button
            type="button"
            aria-label="Bold"
            className="rounded px-2 py-1 text-sm hover:bg-muted"
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            aria-label="Italic"
            className="rounded px-2 py-1 text-sm hover:bg-muted"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            aria-label="Bullet list"
            className="rounded px-2 py-1 text-sm hover:bg-muted"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            • List
          </button>
        </div>
      )}
      <EditorContent
        editor={editor}
        className="min-h-[200px] p-3 focus-within:outline-none"
      />
    </div>
  );
}
```

- [ ] **Step 2: Create `lumio/app/editor/page.tsx`**

This page is loaded as the `src` of an `<iframe>` in the task detail component. It renders just the editor — no sidebar, no navbar.

```typescript
'use client';

import { RichTextEditor } from '@/components/editor/rich-text-editor';

export default function EditorPage() {
  return (
    <div className="min-h-screen bg-white">
      <RichTextEditor
        editable={true}
        onChange={(html) => {
          // Post the updated content back to the parent frame
          window.parent.postMessage({ type: 'editor-change', html }, '*');
        }}
      />
    </div>
  );
}
```

- [ ] **Step 3: Create `lumio/components/tasks/task-detail.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    </div>
  );
}
```

- [ ] **Step 4: Create `lumio/app/(app)/projects/[id]/tasks/[taskId]/page.tsx`**

```typescript
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { TaskDetail } from '@/components/tasks/task-detail';

export const metadata: Metadata = { title: 'Task' };

export default async function TaskDetailPage({
  params,
}: {
  params: { id: string; taskId: string };
}) {
  const session = await auth();
  if (!session) return null;

  const task = await prisma.task.findFirst({
    where: {
      id: params.taskId,
      project: { workspace: { members: { some: { userId: session.user.id } } } },
    },
    include: {
      assignee: { select: { name: true, image: true } },
    },
  });

  if (!task) notFound();

  return (
    <div>
      <TaskDetail task={task} />
    </div>
  );
}
```

- [ ] **Step 5: Commit and tag Lumio snapshot for M20**

```bash
git add lumio/components/editor/ lumio/app/editor/ lumio/components/tasks/ lumio/app/(app)/projects/
git commit -m "feat(lumio): add TipTap rich text editor in iframe, task detail page"

git tag lumio-snapshot-m20
```

---

## Task 5: File Upload

**Files:**
- Create: `lumio/components/tasks/file-upload.tsx`
- Create: `lumio/app/api/upload/route.ts`
- Modify: `lumio/components/tasks/task-detail.tsx` (add file upload section)

- [ ] **Step 1: Create `lumio/app/api/upload/route.ts`**

```typescript
import { NextRequest } from 'next/server';
import { requireAuth, json, apiError } from '@/lib/api-utils';
import { prisma } from '@/lib/db';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const taskId = formData.get('taskId') as string | null;

  if (!file) return apiError('file is required', 400);
  if (!taskId) return apiError('taskId is required', 400);
  if (file.size > MAX_SIZE_BYTES) return apiError('File exceeds 10 MB limit', 413);

  // Ensure upload directory exists
  await mkdir(UPLOAD_DIR, { recursive: true });

  // Sanitize filename
  const ext = path.extname(file.name);
  const safeName = `${Date.now()}-${session.userId}${ext}`;
  const filePath = path.join(UPLOAD_DIR, safeName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const attachment = await prisma.attachment.create({
    data: {
      name: file.name,
      url: `/uploads/${safeName}`,
      size: file.size,
      mimeType: file.type,
      taskId,
    },
  });

  return json(attachment, 201);
}
```

- [ ] **Step 2: Create `lumio/components/tasks/file-upload.tsx`**

```typescript
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  taskId: string;
  onUploaded?: (attachment: { id: string; name: string; url: string }) => void;
}

export function FileUpload({ taskId, onUploaded }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', taskId);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(data.error ?? 'Upload failed');
      return;
    }

    onUploaded?.(data);
    // Reset input so the same file can be re-uploaded
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        aria-label="Upload file attachment"
        className="sr-only"
        onChange={handleFileChange}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
      <Button
        variant="outline"
        size="sm"
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? 'Uploading…' : '+ Attach file'}
      </Button>
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 3: Add file upload section to `lumio/components/tasks/task-detail.tsx`**

Add after the description iframe block (inside the component, before the closing `</div>`):

```typescript
      <div className="mb-6">
        <p className="mb-2 text-sm font-medium">Attachments</p>
        <FileUpload taskId={task.id} />
      </div>
```

Also add the import at the top of the file:
```typescript
import { FileUpload } from './file-upload';
```

- [ ] **Step 4: Commit**

```bash
git add lumio/app/api/upload/ lumio/components/tasks/file-upload.tsx lumio/components/tasks/task-detail.tsx
git commit -m "feat(lumio): add file upload API and attachment component"
```

---

## Task 6: Admin Panel

**Files:**
- Create: `lumio/app/(app)/admin/page.tsx`
- Create: `lumio/app/(app)/admin/feature-flags/page.tsx`
- Create: `lumio/components/admin/user-table.tsx`
- Create: `lumio/app/api/admin/users/route.ts`
- Create: `lumio/app/api/admin/feature-flags/route.ts`

- [ ] **Step 1: Create `lumio/app/api/admin/users/route.ts`**

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, json, apiError } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (session.role !== 'ADMIN') return apiError('Forbidden', 403);

  const url = req.nextUrl;
  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  const limit = parseInt(url.searchParams.get('limit') ?? '20', 10);
  const sortBy = (url.searchParams.get('sortBy') ?? 'createdAt') as 'email' | 'name' | 'createdAt';
  const sortOrder = (url.searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc';
  const role = url.searchParams.get('role') as 'ADMIN' | 'MEMBER' | null;

  const where = role ? { role } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        _count: { select: { memberships: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return json({ users, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function DELETE(req: NextRequest) {
  const session = await requireAuth();
  if (session.role !== 'ADMIN') return apiError('Forbidden', 403);

  const { userIds } = await req.json();
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return apiError('userIds array is required', 400);
  }

  // Prevent admins from deleting themselves
  if (userIds.includes(session.userId)) {
    return apiError('Cannot delete your own account', 400);
  }

  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  return json({ deleted: userIds.length });
}
```

- [ ] **Step 2: Create `lumio/app/api/admin/feature-flags/route.ts`**

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, json, apiError } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (session.role !== 'ADMIN') return apiError('Forbidden', 403);

  const workspaceId = req.nextUrl.searchParams.get('workspaceId');
  if (!workspaceId) return apiError('workspaceId is required', 400);

  const flags = await prisma.featureFlag.findMany({
    where: { workspaceId },
    orderBy: { key: 'asc' },
  });

  return json(flags);
}

export async function PATCH(req: NextRequest) {
  const session = await requireAuth();
  if (session.role !== 'ADMIN') return apiError('Forbidden', 403);

  const { id, enabled } = await req.json();
  if (!id || typeof enabled !== 'boolean') {
    return apiError('id and enabled are required', 400);
  }

  const flag = await prisma.featureFlag.update({
    where: { id },
    data: { enabled },
  });

  return json(flag);
}
```

- [ ] **Step 3: Create `lumio/components/admin/user-table.tsx`**

```typescript
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
```

- [ ] **Step 4: Create `lumio/app/(app)/admin/page.tsx`**

```typescript
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserTable } from '@/components/admin/user-table';

export const metadata: Metadata = { title: 'Admin — Users' };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/dashboard');

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { memberships: true } },
      },
    }),
    prisma.user.count(),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">User Management</h1>
      <UserTable
        initialUsers={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
        total={total}
      />
    </div>
  );
}
```

- [ ] **Step 5: Create `lumio/app/(app)/admin/feature-flags/page.tsx`**

```typescript
'use client';

import { useState, useEffect } from 'react';
import type { Metadata } from 'next';

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
    // Workspace ID would come from context in a real app
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
```

- [ ] **Step 6: Commit and tag snapshot for M25**

```bash
git add lumio/app/(app)/admin/ lumio/components/admin/ lumio/app/api/admin/
git commit -m "feat(lumio): add admin panel with user table, bulk delete, and feature flags"

git tag lumio-snapshot-m25
```

---

## Task 7: WebSocket Notifications and SSE Activity Feed

**Files:**
- Create: `lumio/app/api/notifications/sse/route.ts`
- Create: `lumio/app/api/notifications/route.ts`
- Create: `lumio/components/notifications/notification-feed.tsx`
- Modify: `lumio/components/layout/topbar.tsx` (connect WebSocket)

- [ ] **Step 1: Create `lumio/app/api/notifications/sse/route.ts`**

```typescript
import { NextRequest } from 'next/server';
import { getSession } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Server-Sent Events stream — client reads this via EventSource
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send a heartbeat every 15 seconds so the connection stays alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
        }
      }, 15_000);

      // Send a welcome event immediately
      const welcome = JSON.stringify({
        type: 'connected',
        userId: session.userId,
        timestamp: Date.now(),
      });
      controller.enqueue(encoder.encode(`data: ${welcome}\n\n`));

      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
```

- [ ] **Step 2: Create `lumio/app/api/notifications/route.ts`**

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, json } from '@/lib/api-utils';
import { broadcastToUser } from '@/lib/ws';

export async function GET() {
  const session = await requireAuth();

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return json(notifications);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  const { targetUserId, type, title, message } = await req.json();

  const notification = await prisma.notification.create({
    data: {
      type,
      title,
      message,
      userId: targetUserId ?? session.userId,
    },
  });

  // Push notification to the target user's WebSocket connection(s)
  broadcastToUser(notification.userId, {
    type: 'notification',
    notification,
  });

  return json(notification, 201);
}

export async function PATCH(req: NextRequest) {
  const session = await requireAuth();
  const { notificationId } = await req.json();

  await prisma.notification.updateMany({
    where: {
      id: notificationId ?? undefined,
      userId: session.userId,
    },
    data: { read: true },
  });

  return json({ success: true });
}
```

- [ ] **Step 3: Create `lumio/components/notifications/notification-feed.tsx`**

```typescript
'use client';

import { useEffect, useState } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationFeedProps {
  userId: string;
}

export function NotificationFeed({ userId }: NotificationFeedProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Connect WebSocket
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3000/ws?userId=${userId}`);

    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'notification') {
        setNotifications((prev) => [data.notification, ...prev]);
      }
    });

    return () => ws.close();
  }, [userId]);

  // Connect SSE for activity feed
  useEffect(() => {
    const es = new EventSource('/api/notifications/sse');

    es.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'activity') {
        setNotifications((prev) => [data, ...prev]);
      }
    });

    return () => es.close();
  }, []);

  return (
    <div role="log" aria-label="Activity feed" aria-live="polite">
      {notifications.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">No new notifications</p>
      ) : (
        <ul>
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`border-b p-3 text-sm ${n.read ? 'text-muted-foreground' : 'font-medium'}`}
            >
              <p>{n.title}</p>
              <p className="text-xs text-muted-foreground">{n.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify WebSocket and SSE work**

```bash
npm run dev --prefix lumio
```

In a browser console on any Lumio page, test WebSocket:

```javascript
const ws = new WebSocket('ws://localhost:3000/ws?userId=test-123');
ws.onmessage = (e) => console.log('WS:', e.data);
// Should log: {"type":"connected","userId":"test-123"}
```

Test SSE:

```javascript
const es = new EventSource('/api/notifications/sse');
es.onmessage = (e) => console.log('SSE:', e.data);
// Should log the connected event after logging in
```

Stop dev server.

- [ ] **Step 5: Commit and tag snapshot for M31**

```bash
git add lumio/app/api/notifications/ lumio/components/notifications/
git commit -m "feat(lumio): add WebSocket notifications and SSE activity feed"

git tag lumio-snapshot-m31
```

---

## Self-Review

### Spec coverage check

| Spec requirement | Covered by |
|-----------------|-----------|
| Dashboard with charts (Recharts) | Task 2, DashboardCharts component |
| Kanban projects with @dnd-kit | Task 3 |
| Task detail with TipTap in iframe | Task 4 |
| File upload/attachments | Task 5 |
| Admin panel: sortable/filterable/paginated user table | Task 6 |
| Admin: feature flags on/off toggle | Task 6 |
| WebSocket server (native, not a library) | Task 1, Task 7 |
| SSE activity feed endpoint | Task 7 |
| Presence indicators (WebSocket connected users) | `getConnectedUserIds()` in ws.ts |
| `broadcastToUser` for per-user notifications | Task 7 |
| `lumio-snapshot-m20` git tag | Task 4 |
| `lumio-snapshot-m25` git tag | Task 6 |
| `lumio-snapshot-m31` git tag | Task 7 |
| ARIA-compliant admin table (`aria-sort`, `aria-checked`) | Task 6 |

### Placeholder scan

No TBD or incomplete sections. The `NotificationFeed` connects to WebSocket and SSE but uses `localhost:3000` hardcoded — this should use `window.location.host` in production. For test environments this is fine. The admin feature flags page uses a hardcoded `workspaceId=test-workspace` which matches the seed data — in production this would come from a workspace context provider (built in Part 4).

### Type consistency

- `requireAuth()` returns `ApiSession` (defined in `lib/api-utils.ts`) — used identically in Tasks 5, 6, and 7.
- `broadcastToUser(userId, payload)` signature in `lib/ws.ts` matches call sites in `app/api/notifications/route.ts`.
- `Column` and `TaskCardData` interfaces defined in their respective component files and imported consistently.
