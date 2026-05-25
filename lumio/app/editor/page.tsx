'use client';

import { RichTextEditor } from '@/components/editor/rich-text-editor';

export default function EditorPage() {
  return (
    <div className="min-h-screen bg-white">
      <RichTextEditor
        editable={true}
        onChange={(html) => {
          window.parent.postMessage({ type: 'editor-change', html }, '*');
        }}
      />
    </div>
  );
}
