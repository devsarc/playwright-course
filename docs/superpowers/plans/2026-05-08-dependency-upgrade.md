# Dependency Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade all packages in root and `lumio/` to their latest compatible versions and migrate any breaking API changes.

**Architecture:** Two separate npm manifests are upgraded independently (root devDeps first, then lumio), followed by migration codemods for Next.js 15, Tailwind CSS v4, and Prisma v6, then TypeScript verification in both workspaces.

**Tech Stack:** Playwright 1.45→latest, Next.js 14→15, React 18→19, Tailwind CSS 3→4, Prisma 5→6, next-auth v5-beta→stable, TypeScript 5.4→5.8+, Node.js 20→22 (CI).

---

## Current versions at a glance

| Package | Current | Direction |
|---|---|---|
| `@playwright/test` | ^1.45.0 | minor/patch |
| `next` | 14.2.4 | **major (15)** |
| `react` / `react-dom` | ^18.3.1 | **major (19)** |
| `tailwindcss` | ^3.4.4 | **major (4)** |
| `@prisma/client` / `prisma` | ^5.16.1 | **major (6)** |
| `next-auth` | ^5.0.0-beta.19 | beta→stable |
| `typescript` | ^5.4.5 / ^5 | minor |
| `electron` | ^31.0.0 | major |

---

## Files Modified

| File | Change |
|---|---|
| `package.json` | Bump all devDependency versions |
| `lumio/package.json` | Bump all dependency/devDependency versions |
| `lumio/app/(app)/projects/[id]/page.tsx` | async `params` (Next.js 15) |
| `lumio/app/(app)/projects/[id]/tasks/[taskId]/page.tsx` | async `params` (Next.js 15) |
| `lumio/app/globals.css` | `@tailwind` → `@import "tailwindcss"` + `@theme` |
| `lumio/tailwind.config.ts` | inline into CSS `@theme` (v4 migration) |
| `lumio/postcss.config.mjs` | `tailwindcss` → `@tailwindcss/postcss`; remove `autoprefixer` |
| `lumio/components/ui/input.tsx` | `forwardRef` → React 19 ref-as-prop (if type error) |
| `lumio/components/ui/button.tsx` | `forwardRef` → React 19 ref-as-prop (if type error) |
| `.github/workflows/playwright.yml` | Node 20 → 22 |

---

## Task 1: Audit current outdated packages

**Files:** none (read-only diagnostic)

- [ ] **Step 1: Check root outdated**

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course
npm outdated
```

Expected: table showing current/wanted/latest versions for all root devDeps.

- [ ] **Step 2: Check lumio outdated**

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course/lumio
npm outdated
```

Expected: table showing major jumps for `next`, `react`, `tailwindcss`, `prisma`, etc. Note any unexpected results — if a package is already at latest you can skip it in the install commands.

- [ ] **Step 3: Note the actual Playwright version**

The upgrade for `@playwright/test` and `@playwright/experimental-ct-react` must be the **same version**. Note what version npm resolves.

---

## Task 2: Upgrade root devDependencies

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install all root devDeps at latest**

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course
npm install --save-dev \
  @axe-core/playwright \
  @playwright/experimental-ct-react \
  @playwright/test \
  @types/node \
  @vitejs/plugin-react \
  dotenv \
  tsx \
  typescript
```

- [ ] **Step 2: Verify Playwright versions match**

```bash
node -e "const r=require('./package.json').devDependencies; console.log(r['@playwright/test'], r['@playwright/experimental-ct-react'])"
```

Expected: both semver ranges resolve to the same minor version (e.g., both `^1.52.0`). If they differ, pin one to match the other:

```bash
npm install --save-dev @playwright/experimental-ct-react@$(node -e "console.log(require('./package.json').devDependencies['@playwright/test'].replace('^',''))")
```

- [ ] **Step 3: Confirm root install is clean**

```bash
npm ls --depth=0 2>&1 | head -30
```

Expected: no `UNMET PEER DEPENDENCY` or `MISSING` errors for the packages you just installed.

---

## Task 3: Upgrade lumio production dependencies

**Files:**
- Modify: `lumio/package.json`
- Modify: `lumio/package-lock.json`

- [ ] **Step 1: Install all production deps at latest**

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course/lumio
npm install \
  @auth/prisma-adapter \
  @dnd-kit/core \
  @dnd-kit/sortable \
  @dnd-kit/utilities \
  @prisma/client \
  @radix-ui/react-avatar \
  @radix-ui/react-checkbox \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-label \
  @radix-ui/react-select \
  @radix-ui/react-separator \
  @radix-ui/react-toast \
  @tiptap/pm \
  @tiptap/react \
  @tiptap/starter-kit \
  bcryptjs \
  class-variance-authority \
  clsx \
  lucide-react \
  next \
  next-auth \
  next-intl \
  puppeteer \
  react \
  react-dom \
  recharts \
  tailwind-merge \
  ws \
  zod
```

- [ ] **Step 2: Check for peer dependency warnings**

```bash
npm ls --depth=0 2>&1 | grep -E "UNMET|MISSING|peer"
```

Expected: The most likely peer warning is `next-intl` needing `next@15` — confirm that `next@15` resolved. If `@auth/prisma-adapter` warns about Prisma v6, that's handled in Task 5 after prisma devDep is also upgraded.

- [ ] **Step 3: Note actual next + react versions installed**

```bash
node -e "const d=require('./package.json').dependencies; console.log('next:', d.next, 'react:', d.react)"
```

---

## Task 4: Upgrade lumio dev dependencies

**Files:**
- Modify: `lumio/package.json`

- [ ] **Step 1: Install all dev deps at latest**

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course/lumio
npm install --save-dev \
  @types/bcryptjs \
  @types/node \
  @types/react \
  @types/react-dom \
  @types/ws \
  autoprefixer \
  eslint \
  eslint-config-next \
  postcss \
  prisma \
  tailwindcss \
  tsx \
  typescript \
  electron \
  electron-builder
```

- [ ] **Step 2: Install new Tailwind v4 PostCSS adapter**

Tailwind CSS v4 moved its PostCSS plugin to a separate package.

```bash
npm install --save-dev @tailwindcss/postcss
```

- [ ] **Step 3: Verify eslint-config-next version matches next**

```bash
node -e "const d=require('./package.json'); console.log('next:', d.dependencies.next, 'eslint-config-next:', d.devDependencies['eslint-config-next'])"
```

Expected: both should be the same major version (e.g., both `^15.x.x`). If `eslint-config-next` is still at 14.x run:

```bash
npm install --save-dev eslint-config-next@latest
```

---

## Task 5: Run Next.js 15 upgrade codemod

Next.js 15 made `params` and `searchParams` async (they return a Promise instead of a plain object). The official codemod handles route handlers, layouts, and pages automatically.

**Files:** various files under `lumio/app/` (codemod handles them)

- [ ] **Step 1: Run the Next.js upgrade codemod from inside lumio/**

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course/lumio
npx @next/codemod@canary upgrade latest --no-install
```

The `--no-install` flag skips re-upgrading packages (we already did that). The codemod will:
- Make `params` / `searchParams` props async in page/layout files
- Add `await` where those props are consumed
- Handle `next/headers` `cookies()` / `headers()` async upgrades

- [ ] **Step 2: Review codemod output**

The codemod prints what it changed. Scan the output for any files it reports as **skipped** or **errored** — those need manual attention in Task 6.

- [ ] **Step 3: Verify the two known dynamic route pages were updated**

```bash
grep -n "params" "lumio/app/(app)/projects/[id]/page.tsx"
grep -n "params" "lumio/app/(app)/projects/[id]/tasks/[taskId]/page.tsx"
```

Expected pattern after codemod:
```typescript
params: Promise<{ id: string }>
// and usage:
const { id } = await params;
```

If these lines still show the old sync pattern, proceed to Task 6.

---

## Task 6: Fix async params manually (if codemod missed them)

**Files:**
- Modify: `lumio/app/(app)/projects/[id]/page.tsx`
- Modify: `lumio/app/(app)/projects/[id]/tasks/[taskId]/page.tsx`

Skip this task if Task 5 Step 3 confirmed the codemod already updated both files.

- [ ] **Step 1: Update `projects/[id]/page.tsx`**

Replace the entire function signature and params usage:

```typescript
// BEFORE:
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

// AFTER:
export default async function ProjectBoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session) return null;

  const project = await prisma.project.findFirst({
    where: {
      id,
```

Full updated `lumio/app/(app)/projects/[id]/page.tsx`:

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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session) return null;

  const project = await prisma.project.findFirst({
    where: {
      id,
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
      <KanbanBoard initialColumns={columns} />
    </div>
  );
}
```

- [ ] **Step 2: Update `projects/[id]/tasks/[taskId]/page.tsx`**

Full updated file:

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
  params: Promise<{ id: string; taskId: string }>;
}) {
  const { taskId } = await params;
  const session = await auth();
  if (!session) return null;

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
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

- [ ] **Step 3: Commit Next.js migration changes**

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course
git add lumio/app
git commit -m "fix: migrate async params for Next.js 15"
```

---

## Task 7: Migrate Tailwind CSS 3 → 4

Tailwind v4 uses a CSS-first configuration model. The PostCSS plugin moved to `@tailwindcss/postcss`. The `@tailwind base/components/utilities` directives are replaced with `@import "tailwindcss"`, and theme customization moves into CSS `@theme` blocks.

**Files:**
- Modify: `lumio/postcss.config.mjs`
- Modify: `lumio/app/globals.css`
- Modify: `lumio/tailwind.config.ts` (to add `@config` pointer or migrate to CSS)

- [ ] **Step 1: Try the official upgrade codemod first**

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course/lumio
npx @tailwindcss/upgrade
```

Review what it changed. If it succeeded cleanly, skip Steps 2–4 and go to Step 5.

If the codemod fails or is not available, proceed with Steps 2–4 (manual migration).

- [ ] **Step 2 (manual): Update `lumio/postcss.config.mjs`**

```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
```

(Remove `autoprefixer` — Tailwind v4 handles vendor prefixes internally.)

- [ ] **Step 3 (manual): Update `lumio/app/globals.css`**

```css
@import "tailwindcss";

@theme {
  --color-brand-50: #f0f4ff;
  --color-brand-100: #e0e9ff;
  --color-brand-500: #4f6ef7;
  --color-brand-600: #3b55e6;
  --color-brand-700: #2d45d4;
  --color-brand-900: #1a2a8a;
  --font-sans: var(--font-inter), system-ui, sans-serif;
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --primary: 231 87% 64%;
    --primary-foreground: 0 0% 100%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --destructive: 0 84% 60%;
    --radius: 0.5rem;
  }

  * {
    border-color: hsl(var(--border));
  }

  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

- [ ] **Step 4 (manual): Update `lumio/tailwind.config.ts` to use `@config` pointer**

In Tailwind v4, you can still use a JS config file by referencing it from CSS. Add this line at the top of `globals.css` after the `@import`:

```css
@import "tailwindcss";
@config "../tailwind.config.ts";
```

This keeps the existing `tailwind.config.ts` working for `darkMode: 'class'` and the `content` paths. However, the `theme.extend.colors` in the TS file may conflict with `@theme` in CSS. If so, remove the `@theme` block from Step 3 and keep colors only in `tailwind.config.ts`.

- [ ] **Step 5: Verify Tailwind is producing CSS**

Start the dev server briefly and check there are no PostCSS errors:

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course/lumio
npm run dev 2>&1 | head -20
```

Expected: server starts without `Cannot find module '@tailwindcss/postcss'` or `Unknown at rule` errors. Press Ctrl+C after confirming.

- [ ] **Step 6: Commit Tailwind migration**

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course
git add lumio/postcss.config.mjs lumio/app/globals.css lumio/tailwind.config.ts
git commit -m "fix: migrate to Tailwind CSS v4"
```

---

## Task 8: Regenerate Prisma client + fix Prisma v6 changes

**Files:**
- Modify: `lumio/prisma/schema.prisma` (only if Prisma v6 flags deprecations)

- [ ] **Step 1: Regenerate the Prisma client**

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course/lumio
npx prisma generate
```

Expected: `Generated Prisma Client (v6.x.x) to ./node_modules/@prisma/client`.

- [ ] **Step 2: Check for Prisma v6 schema deprecation warnings**

Prisma v6 removed some deprecated schema directives. Watch the `prisma generate` output for warnings. Common ones:

- `@default(autoincrement())` on String fields — not applicable here (using `cuid()`)
- `relationMode` — not applicable here

If no warnings appear, this step is done.

- [ ] **Step 3: Verify Prisma client imports still work**

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course/lumio
node -e "const { PrismaClient } = require('@prisma/client'); console.log('Prisma v6 OK');"
```

Expected: `Prisma v6 OK` (no import errors).

---

## Task 9: Fix TypeScript errors in lumio/

**Files:** various `lumio/` files depending on which errors arise

- [ ] **Step 1: Run tsc in lumio/**

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course/lumio
npx tsc --noEmit 2>&1
```

Expected: zero errors after all migrations. The most common error patterns and their fixes are listed in Steps 2–5 below. Apply whichever are relevant.

- [ ] **Step 2: Fix React 19 `forwardRef` type errors in `input.tsx` and `button.tsx`**

React 19's `@types/react` v19 deprecates `forwardRef`; the pattern still works but type signatures changed. If you see errors like `Type 'ForwardRefRenderFunction' is not assignable`, convert to the new ref-as-prop pattern.

Updated `lumio/components/ui/input.tsx`:

```typescript
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>;
}

function Input({ className, type, ref, ...props }: InputProps) {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
Input.displayName = 'Input';

export { Input };
```

Updated `lumio/components/ui/button.tsx`:

```typescript
'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-brand-500 text-white hover:bg-brand-600',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-input bg-background hover:bg-muted',
        ghost: 'hover:bg-muted',
        link: 'text-brand-500 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  ref?: React.Ref<HTMLButtonElement>;
}

function Button({ className, variant, size, ref, ...props }: ButtonProps) {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
Button.displayName = 'Button';

export { Button, buttonVariants };
```

- [ ] **Step 3: Fix next-auth session type errors**

next-auth v5 stable may change how the session user type is extended. If you see `Property 'id' does not exist on type 'User'` or similar, create or update the `lumio/types/next-auth.d.ts` type augmentation file:

```typescript
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
    };
  }

  interface User {
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}
```

- [ ] **Step 4: Fix any Prisma v6 query type errors**

Prisma v6 is stricter about nullable fields and removed some deprecated query options. Common fixes:

- `select: { name: true, image: true }` — still valid
- `include: { ... }` — still valid
- If you see `Type 'string | null' is not assignable to type 'string'`, add a null assertion or guard

No changes expected for this codebase based on current schema inspection, but run tsc to confirm.

- [ ] **Step 5: Fix any remaining errors, re-run tsc until clean**

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course/lumio
npx tsc --noEmit 2>&1
```

Expected output: no lines containing `error TS`.

- [ ] **Step 6: Commit type fixes**

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course
git add lumio/
git commit -m "fix: resolve TypeScript errors after major version upgrades in lumio"
```

---

## Task 10: Fix TypeScript errors in root

**Files:** various `tests/`, `scripts/`, and config files as needed

- [ ] **Step 1: Run tsc at root**

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course
npx tsc --noEmit 2>&1
```

Expected: zero errors. The root tsconfig covers `tests/fixtures/**/*.ts`, `scripts/**/*.ts`, and `playwright.config.ts`.

- [ ] **Step 2: Fix Playwright API changes (if any)**

Playwright 1.45→current may have renamed or removed some APIs. Common changes between 1.45 and 1.52:

- `page.locator()` API — unchanged
- `expect()` matchers — `toHaveScreenshot` / `toMatchSnapshot` API — unchanged
- `BrowserContext` / `Page` — unchanged
- `@playwright/experimental-ct-react` — the `mount()` API is unchanged, but check if `ctViteConfig` was renamed in the new version

If you see `Property 'X' does not exist on type 'Y'` for Playwright types, check the Playwright changelog at https://playwright.dev/docs/release-notes.

- [ ] **Step 3: Fix `@axe-core/playwright` type changes (if any)**

```bash
grep -r "checkA11y\|analyze" tests/ 2>/dev/null | head -10
```

If `checkA11y` is used, verify the import still matches the `@axe-core/playwright` v4.10+ API. The function signature is unchanged.

- [ ] **Step 4: Re-run until clean**

```bash
npx tsc --noEmit 2>&1
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add tests/ scripts/ playwright.config.ts playwright-ct.config.ts
git commit -m "fix: resolve TypeScript errors after root devDep upgrades"
```

---

## Task 11: Check Electron main-process API changes

The `lumio/tsconfig.json` excludes `electron/**` from compilation, so `npx tsc --noEmit` won't catch Electron-specific type errors. This task manually verifies `electron/main.ts` against the upgraded Electron types.

**Files:**
- Read: `lumio/electron/main.ts` (no changes expected, but verify)

- [ ] **Step 1: Check what Electron version was installed**

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course/lumio
node -e "console.log(require('./node_modules/electron/package.json').version)"
```

Note the version number (expected: 36.x or latest).

- [ ] **Step 2: Run a focused tsc check on electron/main.ts**

The main tsconfig excludes electron/, so create a one-shot check:

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course/lumio
npx tsc --noEmit --allowJs --moduleResolution node --target ES2022 --esModuleInterop \
  --skipLibCheck false electron/main.ts 2>&1
```

Expected: zero errors. The `main.ts` uses only stable Electron APIs (`app`, `BrowserWindow`, `ipcMain`, `Menu`, `Tray`, `shell`, `nativeImage`) that have not changed signatures between Electron 31 and 36.

- [ ] **Step 3: If type errors appear**

The most common Electron breaking change from v31→v36 is in `BrowserWindow` `webPreferences` — some deprecated options were removed. Current `main.ts` only uses `preload`, `contextIsolation`, and `nodeIntegration`, which are all valid in v36.

If you see `Property 'X' does not exist`, remove the deprecated option from the `webPreferences` object in `createWindow()`:

```typescript
webPreferences: {
  preload: path.join(__dirname, 'preload.js'),
  contextIsolation: true,
  nodeIntegration: false,
  // Remove any option flagged as deprecated/removed
},
```

---

## Task 12: Update CI workflow

**Files:**
- Modify: `.github/workflows/playwright.yml`

- [ ] **Step 1: Update Node.js version from 20 to 22**

Node.js 22 is LTS as of April 2025. Update both `setup-node` steps:

```yaml
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
```

This appears twice in the file (once in `test` job, once in `merge-reports` job). Update both.

- [ ] **Step 2: Verify GitHub Actions are current**

The workflow already uses:
- `actions/checkout@v4` — current
- `actions/setup-node@v4` — current
- `actions/upload-artifact@v4` — current
- `actions/download-artifact@v4` — current

No updates needed for these.

- [ ] **Step 3: Commit the workflow update**

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course
git add .github/workflows/playwright.yml
git commit -m "ci: upgrade Node.js to 22 LTS in Playwright workflow"
```

---

## Task 13: Run smoke test

- [ ] **Step 1: Ensure the database is running**

PostgreSQL must be running at localhost:5432 with the `lumio_test` database. Verify:

```bash
# In WSL2 terminal or PowerShell
psql -U postgres -h localhost -c "\l" 2>&1 | grep lumio_test
```

Expected: `lumio_test` appears in the list. If not, start PostgreSQL in WSL2.

- [ ] **Step 2: Push schema and seed**

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course/lumio
npx prisma db push
npx prisma db seed
```

Expected: schema applied and seed data inserted without errors.

- [ ] **Step 3: Run the module-00 smoke test**

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course
npx playwright test tests/module-00-setup
```

Expected: the test starts the Lumio dev server via `npm run dev --prefix lumio`, the server prints `> Lumio ready on http://localhost:3000`, and Playwright connects successfully. All `module-00` tests pass.

- [ ] **Step 4: If the server fails to start**

Check the webServer timeout — it's 120 seconds. If the server crashes on startup, run it manually to see the error:

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course/lumio
npm run dev 2>&1
```

Common startup failures after upgrades:
- **"Cannot find module '@/lib/auth'"** — next-auth v5 stable import path changed. Update `lumio/lib/auth.ts` to use `import NextAuth from 'next-auth'` (unchanged).
- **"@prisma/client did not initialize"** — re-run `npx prisma generate`.
- **Tailwind postcss error** — re-check `postcss.config.mjs` has `@tailwindcss/postcss`.

---

## Task 14: Final commit

- [ ] **Step 1: Check for any unstaged changes**

```bash
cd C:/Users/presyze/Projects/Personal/playwright-course
git status
git diff --stat
```

- [ ] **Step 2: Stage all package.json and lock file changes**

```bash
git add package.json package-lock.json lumio/package.json lumio/package-lock.json
git status
```

- [ ] **Step 3: Create the final commit**

```bash
git commit -m "chore: upgrade all dependencies to latest compatible versions"
```

- [ ] **Step 4: Verify the commit log**

```bash
git log --oneline -6
```

Expected: the last 6 commits include all the fix commits from this plan plus the final chore commit.

---

## Rollback notes

If a major version upgrade breaks something unresolvable, you can pin back individual packages:

```bash
# Roll back Next.js to 14 (and eslint-config-next to match)
cd lumio && npm install next@14 eslint-config-next@14

# Roll back React to 18
cd lumio && npm install react@18 react-dom@18 @types/react@18 @types/react-dom@18

# Roll back Tailwind to 3
cd lumio && npm install tailwindcss@3 && npm uninstall @tailwindcss/postcss
# Restore postcss.config.mjs to tailwindcss + autoprefixer
# Restore globals.css to @tailwind directives
```
