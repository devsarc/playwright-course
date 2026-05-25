'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function InviteTeamPage() {
  const router = useRouter();
  const [emails, setEmails] = useState(['', '', '']);

  function updateEmail(index: number, value: string) {
    setEmails((prev) => prev.map((e, i) => (i === index ? value : e)));
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-3xl font-bold">Invite your team</h1>
      <p className="mt-2 text-muted-foreground">
        Add teammates to your workspace. You can invite more later.
      </p>

      <div className="mt-8 space-y-3">
        {emails.map((email, i) => (
          <Input
            key={i}
            type="email"
            placeholder={`teammate${i + 1}@example.com`}
            value={email}
            onChange={(e) => updateEmail(i, e.target.value)}
            aria-label={`Teammate ${i + 1} email`}
          />
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push('/onboarding/first-project')}
        >
          Skip for now
        </Button>
        <Button
          className="flex-1"
          onClick={() => router.push('/onboarding/first-project')}
        >
          Send invites
        </Button>
      </div>
    </div>
  );
}
