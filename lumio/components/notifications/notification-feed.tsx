'use client';

import { useEffect, useState } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationFeedProps {
  userId: string;
}

export function NotificationFeed({ userId }: NotificationFeedProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3000/ws?userId=${userId}`);

    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'notification') {
        setNotifications((prev) => [data.notification, ...prev]);
      }
    });

    return () => ws.close();
  }, [userId]);

  useEffect(() => {
    const es = new EventSource('/api/notifications/sse');

    es.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'activity') {
        setNotifications((prev) => [data, ...prev]);
      }
    });

    return () => es.close();
  }, []);

  return (
    <div role="log" aria-label="Activity feed" aria-live="polite">
      {notifications.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">No new notifications</p>
      ) : (
        <ul>
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`border-b p-3 text-sm ${n.read ? 'text-muted-foreground' : 'font-medium'}`}
            >
              <p>{n.title}</p>
              <p className="text-xs text-muted-foreground">{n.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
