import { createHash } from 'crypto';
import { readFileSync, existsSync } from 'fs';

export function computeFileHash(filePath: string): string | null {
  if (!existsSync(filePath)) return null;
  const contents = readFileSync(filePath, 'utf-8');
  return createHash('sha256').update(contents).digest('hex').slice(0, 12);
}
