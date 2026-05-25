# Lumio Context: M67

## What's in Lumio at this point

M67's branch adds Lumio's AI chat panel — a collapsible sidebar that lets users ask questions about their workspace ("What tasks are overdue?", "Summarize this week's activity"). The panel communicates with the `/api/chat` endpoint which streams tokens via SSE.

## Chat panel anatomy

```
[chat-panel]
  [chat-message-list]
    [chat-message]  (data-role="user" or data-role="assistant")
    [chat-message]
    ...
  [chat-typing-indicator]  (hidden when not streaming)
  [chat-input]            (contenteditable div, not a textarea)
  [chat-send-button]
```

The `chat-input` is a `contenteditable` div — rich text input is planned for a future sprint, so TipTap wasn't used here. The component dispatches a submit event on Enter keypress.

## TipTap editor context

The task detail panel's description field uses TipTap in an iframe (`[data-testid="tiptap-frame"]`). This matches the M24 pattern. The iframe approach isolates TipTap's CSS from the rest of the app.

## Streaming response format

The `/api/chat` endpoint streams using SSE with this format:

```
data: {"token":"word"}

data: [DONE]

```

The frontend accumulates tokens into the assistant message element. The `[DONE]` sentinel hides the typing indicator and marks the stream as complete.

## Testing considerations

- The real `/api/chat` endpoint calls an external AI provider (Claude API). Always mock this in tests to avoid latency, cost, and flakiness.
- The mock response body in `MOCK_CHAT_SSE` produces "You have 3 overdue tasks." — deterministic content suitable for `toContainText()` assertions.
