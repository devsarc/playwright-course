import type { Metadata } from 'next';
import { ChatInterface } from '@/components/chat/chat-interface';

export const metadata: Metadata = { title: 'AI Assistant' };

export default function ChatPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">AI Assistant</h1>
      <ChatInterface />
    </div>
  );
}
