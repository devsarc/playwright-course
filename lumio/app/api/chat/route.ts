import { NextRequest } from 'next/server';
import { requireAuth, json } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  await requireAuth();
  const { message } = await req.json();

  const responses = [
    `I can help you with that. Here's what I found about "${message}":`,
    'Based on your tasks, I recommend focusing on high-priority items first.',
    'I noticed you have 3 overdue tasks. Would you like me to reschedule them?',
  ];

  const reply = responses[Math.floor(Math.random() * responses.length)];

  await new Promise((r) => setTimeout(r, 800));

  return json({ message: reply, timestamp: new Date().toISOString() });
}
