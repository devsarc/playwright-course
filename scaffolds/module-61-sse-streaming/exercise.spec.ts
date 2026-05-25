import { test, expect } from '../fixtures/fixtures';

// M61: SSE & Streaming

const SSE_BODY = [
  'id: 1\nevent: task.created\ndata: {"taskId":"t1","title":"Fix login bug"}\n\n',
  'id: 2\nevent: task.updated\ndata: {"taskId":"t1","status":"in_progress"}\n\n',
  'id: 3\nevent: task.created\ndata: {"taskId":"t2","title":"Add dark mode"}\n\n',
].join('');

test.describe('M61 — SSE & Streaming', () => {

  // Test 1: Mock the SSE endpoint and receive events
  test('mock SSE endpoint delivers events to the page', async ({ page }) => {
    // TODO 1: Use page.route() to intercept '**/api/activity-stream'.
    // Fulfill with: status 200, Content-Type 'text/event-stream', body SSE_BODY.
    // Why? Mocking SSE via page.route() gives full control over event sequence and timing.
    await page.route(/* TODO 1: replace '**/PLACEHOLDER' with the SSE endpoint glob */ '**/PLACEHOLDER', route => {
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
        body: SSE_BODY,
      });
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(500);

    // The activity feed should have rendered at least two items from the mock events
    // TODO 2: Assert that the activity feed list has at least 2 items.
    const feedItems = page.getByTestId('activity-feed-item');
    await expect(feedItems).toHaveCount(/* TODO 2: 3 */ 0);
  });

  // Test 2: Assert event ordering in the rendered activity feed
  test('events render in the order they arrive in the stream', async ({ page }) => {
    await page.route('**/api/activity-stream', route => {
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
        body: SSE_BODY,
      });
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(500);

    const firstItem = page.getByTestId('activity-feed-item').first();

    // TODO 3: Assert that the first activity feed item contains text 'Fix login bug'
    // (the title from the first SSE event).
    // Why? Event ordering matters — a feed that reverses events misleads the user about history.
    await expect(firstItem).toContainText(/* TODO 3: 'Fix login bug' */ 'PLACEHOLDER');
  });

  // Test 3: SSE Content-Type header is text/event-stream
  test('SSE endpoint uses the correct Content-Type header', async ({ page }) => {
    let contentType = '';

    page.on('response', response => {
      if (response.url().includes('/api/activity-stream')) {
        contentType = response.headers()['content-type'] ?? '';
      }
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(300);

    // TODO 4: Assert that contentType includes 'text/event-stream'.
    // Why? The browser's EventSource only handles SSE responses with this Content-Type.
    expect(contentType).toContain(/* TODO 4: 'text/event-stream' */ 'PLACEHOLDER');
  });

  // Test 4: EventSource reconnects and sends Last-Event-ID
  test('EventSource sends Last-Event-ID on reconnect', async ({ page }) => {
    let lastEventId = '';
    let requestCount = 0;

    await page.route('**/api/activity-stream', route => {
      requestCount++;
      // TODO 5: On the second request (requestCount > 1), capture the 'last-event-id' header.
      if (requestCount > 1) {
        lastEventId = route.request().headers()[/* TODO 5: 'last-event-id' */ 'x-placeholder'] ?? '';
      }
      // First request: send two events then close; second request: send empty stream
      const body = requestCount === 1 ? SSE_BODY : '\n\n';
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
        body,
      });
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(3000); // EventSource waits ~3s before reconnecting

    // TODO 6: Assert that lastEventId equals '3' (the last event ID from the initial stream).
    expect(lastEventId).toBe(/* TODO 6: '3' */ '');
  });

  // Test 5: SSE vs WebSocket — directional distinction
  test('SSE is server-to-client only; WebSocket is bidirectional', async ({}) => {
    // SSE uses a plain HTTP GET — the server streams text/event-stream.
    // The browser cannot send messages back over the same connection.
    // WebSocket upgrades the connection to a full-duplex channel.

    // TODO 7: What browser API does SSE use? (hint: it's not WebSocket)
    const sseApi = /* TODO 7: 'EventSource' */ '';
    expect(sseApi).toBe('EventSource');
  });

  // Test 6: Parse SSE data payload
  test('SSE data field contains valid JSON', async ({ page }) => {
    const payloads: Array<{ taskId: string; title?: string; status?: string }> = [];

    await page.route('**/api/activity-stream', route => {
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
        body: SSE_BODY,
      });
    });

    // Collect data payloads via page.evaluate after events render
    await page.goto('/dashboard');
    await page.waitForTimeout(500);

    // The activity feed items expose their taskId via data-task-id attribute
    const taskIds = await page.getByTestId('activity-feed-item').evaluateAll(
      els => els.map(el => el.getAttribute('data-task-id'))
    );

    // TODO 8: Assert that taskIds includes 't1' (the taskId from the first mock SSE event).
    expect(taskIds).toContain(/* TODO 8: 't1' */ 'PLACEHOLDER');
  });

});
