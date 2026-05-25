import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, json } from '@/lib/api-utils';
import { broadcastToUser } from '@/lib/ws';

export async function GET() {
  const session = await requireAuth();

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return json(notifications);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  const { targetUserId, type, title, message } = await req.json();

  const notification = await prisma.notification.create({
    data: {
      type,
      title,
      message,
      userId: targetUserId ?? session.userId,
    },
  });

  broadcastToUser(notification.userId, {
    type: 'notification',
    notification,
  });

  return json(notification, 201);
}

export async function PATCH(req: NextRequest) {
  const session = await requireAuth();
  const { notificationId } = await req.json();

  await prisma.notification.updateMany({
    where: {
      id: notificationId ?? undefined,
      userId: session.userId,
    },
    data: { read: true },
  });

  return json({ success: true });
}
