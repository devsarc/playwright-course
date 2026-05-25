import { test, expect } from '../fixtures/fixtures';

// M67: Chatbot & Rich UI Interaction

const MOCK_CHAT_SSE =
  'data: {"token":"You have "}\n\n' +
  'data: {"token":"3 overdue"}\n\n' +
  'data: {"token":" tasks."}\n\n' +
  'data: [DONE]\n\n';

test.describe('M67 — Chatbot & Rich UI Interaction', () => {

  // Test 1: Type in a contenteditable editor
  test('pressSequentially types into a contenteditable chat input', async ({ page }) => {
    await page.goto('/dashboard');

    const chatInput = page.getByTestId('chat-input');

    // TODO 1: Click chatInput to focus it, then call pressSequentially('What tasks are overdue?').
    // Why? contenteditable does not accept fill() — it requires keyboard events via pressSequentially().
    await chatInput./* TODO 1: click() */ focus();
    await chatInput./* TODO 1: pressSequentially('What tasks are overdue?') */ fill('');

    // TODO 2: Assert that chatInput contains the text 'What tasks are overdue?'.
    await expect(chatInput).toContainText(/* TODO 2: 'What tasks are overdue?' */ 'PLACEHOLDER');
  });

  // Test 2: Send a message and assert typing indicator appears
  test('typing indicator appears after sending a chat message', async ({ page }) => {
    await page.goto('/dashboard');

    const chatInput = page.getByTestId('chat-input');
    await chatInput.click();
    await chatInput.pressSequentially('Hello');

    // TODO 3: Press 'Enter' via page.keyboard to send the message.
    // Why? The chat input uses Enter to send (Shift+Enter for newline).
    await page.keyboard.press(/* TODO 3: 'Enter' */ 'Tab');

    // TODO 4: Assert that the typing indicator is visible within 1000ms.
    await expect(page.getByTestId('chat-typing-indicator'))./* TODO 4: toBeVisible({ timeout: 1000 }) */ toBeHidden();
  });

  // Test 3: Mock chat API and assert streamed response
  test('streamed response renders in the chat panel', async ({ page }) => {
    // TODO 5: Route '**/api/chat' to fulfill with:
    //   status 200, Content-Type: 'text/event-stream', body: MOCK_CHAT_SSE.
    // Why? Mocking the chat endpoint makes the response deterministic and instant.
    await page.route(/* TODO 5: replace '**/PLACEHOLDER' with the chat API glob */ '**/PLACEHOLDER', route => {
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: MOCK_CHAT_SSE,
      });
    });

    await page.goto('/dashboard');
    const chatInput = page.getByTestId('chat-input');
    await chatInput.click();
    await chatInput.pressSequentially('What tasks are overdue?');
    await page.keyboard.press('Enter');

    // Wait for indicator to disappear (streaming complete)
    await expect(page.getByTestId('chat-typing-indicator')).toBeHidden({ timeout: 5000 });

    // TODO 6: Assert that the last chat message contains '3 overdue'.
    await expect(page.getByTestId('chat-message').last()).toContainText(/* TODO 6: '3 overdue' */ 'PLACEHOLDER');
  });

  // Test 4: Typing indicator disappears after streaming completes
  test('typing indicator disappears when response finishes', async ({ page }) => {
    await page.route('**/api/chat', route => {
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: MOCK_CHAT_SSE,
      });
    });

    await page.goto('/dashboard');
    const chatInput = page.getByTestId('chat-input');
    await chatInput.click();
    await chatInput.pressSequentially('Hello');
    await page.keyboard.press('Enter');

    // Indicator appears, then disappears
    await expect(page.getByTestId('chat-typing-indicator')).toBeVisible({ timeout: 1000 });

    // TODO 7: Assert that the typing indicator is hidden within 5000ms (streaming completed).
    await expect(page.getByTestId('chat-typing-indicator'))./* TODO 7: toBeHidden({ timeout: 5000 }) */ toBeVisible();
  });

  // Test 5: TipTap task description editor
  test('pressSequentially types into TipTap task description', async ({ page }) => {
    await page.goto('/dashboard');

    // Open a task to access the TipTap editor
    await page.getByTestId('task-card').first().click();
    await page.waitForSelector('[data-testid="task-detail-panel"]');

    // TipTap renders as contenteditable — inside an iframe in Lumio
    const editorFrame = page.frameLocator('[data-testid="tiptap-frame"]');
    const editor = editorFrame.locator('[contenteditable="true"]');

    await editor.click();

    // TODO 8: Call editor.pressSequentially('My task note') to type into the TipTap editor.
    await editor./* TODO 8: pressSequentially('My task note') */ fill('');

    // TODO 9: Assert that editor contains the text 'My task note'.
    await expect(editor).toContainText(/* TODO 9: 'My task note' */ 'PLACEHOLDER');
  });

  // Test 6: Chat message count increases after sending
  test('chat message list grows after each send', async ({ page }) => {
    await page.route('**/api/chat', route => {
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: MOCK_CHAT_SSE,
      });
    });

    await page.goto('/dashboard');
    const chatMessages = page.getByTestId('chat-message');
    const initialCount = await chatMessages.count();

    const chatInput = page.getByTestId('chat-input');
    await chatInput.click();
    await chatInput.pressSequentially('Test message');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('chat-typing-indicator')).toBeHidden({ timeout: 5000 });

    // After sending one message and receiving a response, count should be initialCount + 2
    // TODO 10: Assert that chatMessages count equals initialCount + 2.
    await expect(chatMessages).toHaveCount(/* TODO 10: initialCount + 2 */ initialCount);
  });

});
