'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface RichTextEditorProps {
  content?: string;
  editable?: boolean;
  onChange?: (html: string) => void;
}

export function RichTextEditor({
  content = '',
  editable = true,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  return (
    <div className="prose prose-sm max-w-none">
      {editable && (
        <div className="flex gap-1 border-b p-2">
          <button
            type="button"
            aria-label="Bold"
            className="rounded px-2 py-1 text-sm hover:bg-muted"
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            aria-label="Italic"
            className="rounded px-2 py-1 text-sm hover:bg-muted"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            aria-label="Bullet list"
            className="rounded px-2 py-1 text-sm hover:bg-muted"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            • List
          </button>
        </div>
      )}
      <EditorContent
        editor={editor}
        className="min-h-[200px] p-3 focus-within:outline-none"
      />
    </div>
  );
}
