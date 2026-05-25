import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer } from 'ws';
import { registerClient } from './lib/ws';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const nextUpgrade = app.getUpgradeHandler();

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws, req) => {
    const url = parse(req.url ?? '', true);
    const userId = url.query.userId as string | undefined;

    if (!userId) {
      ws.close(4001, 'userId required');
      return;
    }

    registerClient(userId, ws);
    ws.send(JSON.stringify({ type: 'connected', userId }));
  });

  server.on('upgrade', (req, socket, head) => {
    const { pathname } = parse(req.url!);
    if (pathname === '/ws') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    } else {
      nextUpgrade(req, socket, head);
    }
  });

  const port = parseInt(process.env.PORT ?? '3000', 10);
  server.listen(port, () => {
    console.log(`> Lumio ready on http://localhost:${port}`);
  });
});
