import { WebSocket } from 'ws';

const clients = new Map<string, Set<WebSocket>>();

export function registerClient(userId: string, ws: WebSocket): void {
  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId)!.add(ws);

  ws.on('close', () => {
    clients.get(userId)?.delete(ws);
    if (clients.get(userId)?.size === 0) clients.delete(userId);
  });
}

export function broadcastToUser(userId: string, payload: object): void {
  const userClients = clients.get(userId);
  if (!userClients) return;

  const message = JSON.stringify(payload);
  for (const ws of userClients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
}

export function broadcastToAll(payload: object): void {
  const message = JSON.stringify(payload);
  for (const userClients of clients.values()) {
    for (const ws of userClients) {
      if (ws.readyState === WebSocket.OPEN) ws.send(message);
    }
  }
}

export function getConnectedUserIds(): string[] {
  return Array.from(clients.keys());
}
