import { NextRequest } from 'next/server';
import { requireAuth, json, apiError } from '@/lib/api-utils';
import { prisma } from '@/lib/db';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const taskId = formData.get('taskId') as string | null;

  if (!file) return apiError('file is required', 400);
  if (!taskId) return apiError('taskId is required', 400);
  if (file.size > MAX_SIZE_BYTES) return apiError('File exceeds 10 MB limit', 413);

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.name);
  const safeName = `${Date.now()}-${session.userId}${ext}`;
  const filePath = path.join(UPLOAD_DIR, safeName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const attachment = await prisma.attachment.create({
    data: {
      name: file.name,
      url: `/uploads/${safeName}`,
      size: file.size,
      mimeType: file.type,
      taskId,
    },
  });

  return json(attachment, 201);
}
