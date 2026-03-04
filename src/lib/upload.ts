import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { v2 as cloudinary } from 'cloudinary';

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};
const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const CLOUDINARY_FOLDER = 'midnight-news';

function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

function resolveImageExt(file: File): string | null {
  const fromType = ALLOWED_IMAGE_TYPES[file.type];
  if (fromType) return fromType;
  const fromName = path.extname(file.name || '').toLowerCase();
  if (ALLOWED_IMAGE_EXTENSIONS.has(fromName)) {
    return fromName === '.jpeg' ? '.jpg' : fromName;
  }
  return null;
}

async function uploadToCloudinary(file: File): Promise<{ imageUrl: string } | { error: string }> {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: CLOUDINARY_FOLDER,
      resource_type: 'image',
    });

    return { imageUrl: result.secure_url };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Cloudinary upload failed.';
    return { error: msg };
  }
}

async function uploadToLocal(file: File, ext: string): Promise<{ imageUrl: string } | { error: string }> {
  const name = `${randomUUID()}${ext}`;
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    return { imageUrl: `/uploads/${name}` };
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err?.code === 'ENOENT' || err?.code === 'EROFS') {
      return {
        error:
          'File system is read-only. Configure Cloudinary (CLOUDINARY_*) in .env for image uploads.',
      };
    }
    throw e;
  }
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

  if (isCloudinaryConfigured()) {
    return uploadToCloudinary(file);
  }

  if (process.env.VERCEL) {
    return {
      error:
        'Image upload requires Cloudinary. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to Vercel env vars.',
    };
  }

  return uploadToLocal(file, ext);
}
