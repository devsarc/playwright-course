# M67: Chatbot & Rich UI Interaction

## Learning Objectives

- Automate Lumio's AI chat panel: type a message and assert the response appears
- Test a streaming text response using progressive assertion patterns
- Assert typing indicator appearance and disappearance
- Interact with TipTap's `contenteditable` rich text editor from test code

## Concept

Modern web applications contain increasingly complex UI components that don't map cleanly to standard HTML form controls. Two categories require special treatment: **contenteditable rich text editors** (TipTap, ProseMirror, Quill) and **AI chat interfaces** with streaming responses. Both require different interaction techniques than `fill()`.

**contenteditable editors.**

TipTap renders into a `<div contenteditable="true">` element — not an `<input>` or `<textarea>`. The standard `fill()` action doesn't work because `fill()` expects a native form control. For contenteditable, use `click()` to focus the element and then `type()` or `pressSequentially()` to dispatch keyboard events:

```typescript
const editor = page.locator('[contenteditable="true"]');
await editor.click();
await editor.pressSequentially('This is my task description.');
```

For richer interactions (bold, italic, links), use keyboard shortcuts as a real user would:

```typescript
await editor.click();
await editor.pressSequentially('Important note');
await page.keyboard.down('Control');
await editor.press('a'); // select all
await page.keyboard.up('Control');
await page.keyboard.down('Control');
await editor.press('b'); // bold
await page.keyboard.up('Control');
```

TipTap renders in an iframe in some configurations (M24 covered this). When the editor is inside an iframe, scope the locator through `frameLocator()` first.

**AI chat interface automation.**

Chat panels present two challenges: the input is often a `contenteditable` div (not a `textarea`), and responses arrive as streaming tokens rather than a single DOM update.

Typing and sending a message:

```typescript
const chatInput = page.getByTestId('chat-input');
await chatInput.click();
await chatInput.pressSequentially('What tasks are overdue?');
await page.keyboard.press('Enter');
```

Or if the input uses `Shift+Enter` for newlines and `Enter` to send:

```typescript
await chatInput.fill('What tasks are overdue?'); // works if it's a textarea
await page.keyboard.press('Enter');
```

**Streaming text assertion.**

AI responses stream token by token. The DOM updates incrementally — a `<p>` element that starts empty gradually fills with text. Two assertion strategies:

*Wait for completion indicator.* The cleanest: wait until the streaming indicator (spinner, "Generating..." text, cursor animation) disappears, then assert the full response:

```typescript
await expect(page.getByTestId('chat-typing-indicator')).toBeHidden({ timeout: 15000 });
const response = await page.getByTestId('chat-message').last().textContent();
expect(response?.length).toBeGreaterThan(0);
```

*Assert for partial text.* When you know part of the response content (e.g., you're mocking the API):

```typescript
// Mock the streaming endpoint
await page.route('**/api/chat', route => {
  route.fulfill({
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
    body: 'data: {"token":"You have "}\n\ndata: {"token":"3 overdue tasks"}\n\ndata: [DONE]\n\n',
  });
});

// Assert the rendered text once streaming completes
await expect(page.getByTestId('chat-message').last()).toContainText('3 overdue tasks', { timeout: 5000 });
```

**Typing indicator testing.**

The typing indicator (the animated "..." or spinner that appears while the AI is generating) should:
1. Appear immediately when the user sends a message
2. Disappear when the response finishes streaming

```typescript
await page.getByTestId('chat-input').pressSequentially('Hello');
await page.keyboard.press('Enter');

// Indicator should appear quickly
await expect(page.getByTestId('chat-typing-indicator')).toBeVisible({ timeout: 1000 });

// Then disappear when response completes
await expect(page.getByTestId('chat-typing-indicator')).toBeHidden({ timeout: 15000 });
```

This two-step assertion pattern ensures both that the indicator appeared (user sees loading state) and that it correctly cleaned up.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-67-chatbot-rich-ui-interaction
```

## Key Takeaways

1. `contenteditable` editors require `click()` to focus and `pressSequentially()` to type — not `fill()`.
2. For streaming text, wait for the completion indicator to disappear, then assert the full response.
3. Mock the chat API with an SSE response body to control response content in tests.
4. The typing indicator should appear on send and disappear on completion — test both transitions.
5. TipTap inside an iframe requires `frameLocator()` scoping before any locator calls.

## Going Deeper

- [Playwright docs: locator.pressSequentially()](https://playwright.dev/docs/api/class-locator#locator-press-sequentially)
- [TipTap docs: Testing with Playwright](https://tiptap.dev/docs/editor/getting-started/install)
- [Playwright docs: contenteditable interactions](https://playwright.dev/docs/input#type-characters)
