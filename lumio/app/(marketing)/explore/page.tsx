import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Navbar } from '@/components/layout/navbar';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Explore Projects',
  description: 'Browse public Lumio projects shared by the community.',
};

export default async function ExplorePage() {
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

        {/* Pagination link for crawling tests */}
        <nav aria-label="Pagination" className="mt-8 text-center">
          <Link href="/explore?page=2" className="text-brand-500 hover:underline text-sm">
            Next page →
          </Link>
        </nav>
      </main>
    </div>
  );
}
