import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = { title: 'Documentation' };

export default function DocsPage() {
  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold">Documentation</h1>
        <p className="mt-4 text-muted-foreground">
          Lumio documentation is available here.
        </p>
      </main>
    </div>
  );
}
