import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Members' };

export default function MembersPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Members</h1>
      <p className="mt-2 text-muted-foreground">Team member management coming soon.</p>
    </div>
  );
}
