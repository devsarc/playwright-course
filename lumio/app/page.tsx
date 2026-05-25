import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';

const FEATURES = [
  {
    title: 'Kanban boards',
    description: 'Drag-and-drop tasks across custom columns with real-time sync.',
    icon: '📋',
  },
  {
    title: 'Rich text docs',
    description: 'Write documents and task notes with a full-featured editor.',
    icon: '📝',
  },
  {
    title: 'Team presence',
    description: 'See who is online and what they are working on right now.',
    icon: '👥',
  },
  {
    title: 'Notifications',
    description: 'Real-time updates when tasks are assigned, moved, or commented on.',
    icon: '🔔',
  },
];

const PRICING_TIERS = [
  {
    name: 'Free',
    price: '$0',
    description: 'For individuals and small teams getting started.',
    features: ['Up to 3 projects', '5 team members', '1 GB storage'],
    cta: 'Get started free',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$12',
    description: 'For growing teams that need more power.',
    features: ['Unlimited projects', '25 team members', '50 GB storage', 'Priority support'],
    cta: 'Start free trial',
    href: '/signup?plan=pro',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations with advanced needs.',
    features: ['Unlimited everything', 'SSO/SAML', 'SLA guarantee', 'Dedicated support'],
    cta: 'Contact sales',
    href: '/contact',
    highlighted: false,
  },
];

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="min-h-screen">
      <Navbar session={session} />

      {/* Hero */}
      <section aria-labelledby="hero-heading" className="bg-linear-to-b from-brand-50 to-white py-20 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h1 id="hero-heading" className="text-5xl font-bold tracking-tight text-gray-900">
            The productivity platform your team will actually use
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            Lumio combines kanban boards, rich-text docs, and real-time collaboration in one
            place — so your team spends less time switching tools.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/signup">
              <Button size="lg">Get started free</Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg">
                View docs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section aria-labelledby="features-heading" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 id="features-heading" className="text-center text-3xl font-bold text-gray-900">
            Everything your team needs
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-card p-6"
                data-testid="feature-card"
              >
                <div className="text-3xl">{feature.icon}</div>
                <h3 className="mt-4 font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing (abbreviated — full page at /pricing) */}
      <section aria-labelledby="pricing-heading" className="bg-muted/50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 id="pricing-heading" className="text-center text-3xl font-bold text-gray-900">
            Simple, transparent pricing
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl border p-8 ${
                  tier.highlighted
                    ? 'border-brand-500 bg-brand-500 text-white shadow-lg'
                    : 'bg-card'
                }`}
                data-testid={`pricing-card-${tier.name.toLowerCase()}`}
              >
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <div className="mt-2 text-4xl font-bold">
                  {tier.price}
                  {tier.price !== 'Custom' && (
                    <span className="text-base font-normal opacity-70">/mo</span>
                  )}
                </div>
                <p className={`mt-2 text-sm ${tier.highlighted ? 'text-white/80' : 'text-muted-foreground'}`}>
                  {tier.description}
                </p>
                <ul className="mt-6 space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <span>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href={tier.href} className="mt-8 block">
                  <Button
                    variant={tier.highlighted ? 'outline' : 'default'}
                    className={`w-full ${tier.highlighted ? 'border-white text-white hover:bg-white hover:text-brand-600' : ''}`}
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between">
            <span className="font-bold text-brand-600">Lumio</span>
            <nav aria-label="Footer navigation">
              <ul className="flex gap-6" role="list">
                <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link></li>
                <li><Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground">Docs</Link></li>
                <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link></li>
                <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link></li>
              </ul>
            </nav>
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Lumio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
