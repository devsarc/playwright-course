import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = { title: 'Changelog' };

const CHANGES = [
  { version: '1.3.0', date: '2024-03-01', summary: 'Added AI assistant and rich text editor improvements.' },
  { version: '1.2.0', date: '2024-02-01', summary: 'Kanban boards now support drag-drop reordering across columns.' },
  { version: '1.1.0', date: '2024-01-15', summary: 'Initial public launch with team workspaces and task management.' },
];

export default function ChangelogPage() {
  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold">Changelog</h1>
        <div className="mt-8 space-y-8">
          {CHANGES.map((change) => (
            <article key={change.version} className="border-b pb-8">
              <div className="flex items-center gap-3">
                <span className="rounded bg-brand-100 px-2 py-0.5 text-sm font-medium text-brand-700">
                  v{change.version}
                </span>
                <time className="text-sm text-muted-foreground">{change.date}</time>
              </div>
              <p className="mt-2 text-muted-foreground">{change.summary}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
