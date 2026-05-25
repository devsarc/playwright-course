# M67 Hints

## TODO 1 — Click and pressSequentially on contenteditable

```typescript
await chatInput.click();
await chatInput.pressSequentially('What tasks are overdue?');
```

`fill()` clears the element and sets the value via the DOM API — it works on `<input>` and `<textarea>`, but not `contenteditable`. `pressSequentially()` fires a `keydown`, `keypress`, `input`, and `keyup` event per character, exactly as a user typing would.

## TODO 2 — Assert contenteditable text

```typescript
await expect(chatInput).toContainText('What tasks are overdue?');
```

`toContainText()` reads the element's `textContent` — works for both standard elements and `contenteditable`.

## TODO 3 — Press Enter to send

```typescript
await page.keyboard.press('Enter');
```

`page.keyboard.press()` fires a global key event. For the chat input, this triggers the send handler.

## TODO 4 — Assert typing indicator visible

```typescript
await expect(page.getByTestId('chat-typing-indicator')).toBeVisible({ timeout: 1000 });
```

The 1000ms timeout gives the app time to register the submission and show the indicator. If it's not visible within 1 second, the send handler is broken.

## TODO 5 — Route the chat API

```typescript
await page.route('**/api/chat', route => {
  route.fulfill({
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
    body: MOCK_CHAT_SSE,
  });
});
```

The `MOCK_CHAT_SSE` constant at the top of the file contains the complete SSE stream. The response body is delivered synchronously — the browser parses it as a stream of `data:` events.

## TODO 6 — Assert last message content

```typescript
await expect(page.getByTestId('chat-message').last()).toContainText('3 overdue');
```

`.last()` gets the final message in the list. After streaming completes, all three tokens from `MOCK_CHAT_SSE` are concatenated: "You have 3 overdue tasks."

## TODO 7 — Assert indicator hidden

```typescript
await expect(page.getByTestId('chat-typing-indicator')).toBeHidden({ timeout: 5000 });
```

## TODO 8 — pressSequentially in TipTap editor

```typescript
await editor.pressSequentially('My task note');
```

## TODO 9 — Assert editor text

```typescript
await expect(editor).toContainText('My task note');
```

## TODO 10 — Assert message count

```typescript
await expect(chatMessages).toHaveCount(initialCount + 2);
```

+2 because: one message for the user's question and one for the AI's response. If `initialCount` was 0 (empty chat), the count should be 2 after one exchange.
