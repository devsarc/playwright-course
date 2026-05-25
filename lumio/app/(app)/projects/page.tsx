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
