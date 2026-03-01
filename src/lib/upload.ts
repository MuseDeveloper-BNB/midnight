import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};
const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

function resolveImageExt(file: File): string | null {
  const fromType = ALLOWED_IMAGE_TYPES[file.type];
  if (fromType) return fromType;
  const fromName = path.extname(file.name || '').toLowerCase();
  if (ALLOWED_IMAGE_EXTENSIONS.has(fromName)) {
    return fromName === '.jpeg' ? '.jpg' : fromName;
  }
  return null;
}

export async function saveUploadedImage(
  file: File
): Promise<{ imageUrl: string } | { error: string }> {
  const ext = resolveImageExt(file);
  if (!ext) {
    return { error: 'Invalid image type. Use JPEG, PNG, WebP or GIF.' };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { error: 'Image must be 10MB or less.' };
  }
  const name = `${randomUUID()}${ext}`;
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, name);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);
  return { imageUrl: `/uploads/${name}` };
}
