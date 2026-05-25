'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  taskId: string;
  onUploaded?: (attachment: { id: string; name: string; url: string }) => void;
}

export function FileUpload({ taskId, onUploaded }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', taskId);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(data.error ?? 'Upload failed');
      return;
    }

    onUploaded?.(data);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        aria-label="Upload file attachment"
        className="sr-only"
        onChange={handleFileChange}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
      <Button
        variant="outline"
        size="sm"
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? 'Uploading…' : '+ Attach file'}
      </Button>
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
