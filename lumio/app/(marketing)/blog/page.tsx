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
