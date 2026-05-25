import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Pricing' };

export default function PricingPage() {
  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="text-center text-4xl font-bold">Pricing</h1>
        <p className="mt-4 text-center text-lg text-muted-foreground">
          Start free. Upgrade when your team grows.
        </p>
        <div className="mt-12 text-center">
          <Link href="/signup">
            <Button size="lg">Get started for free</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
