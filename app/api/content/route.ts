import { NextResponse } from 'next/server';
import { contentService } from '@/services/content/content.service';
import { rateLimit } from '@/utils/rate-limit';
import type { ContentType } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success } = await rateLimit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as ContentType | null;
  const limit = Number(searchParams.get('limit') ?? 20);
  const offset = Number(searchParams.get('offset') ?? 0);
  const sort = (searchParams.get('sort') as 'newest' | 'oldest' | null) ?? 'newest';

  const content = await contentService.getPublishedContent({
    type: type ?? undefined,
    limit,
    offset,
    sort,
  });

  return NextResponse.json({ content, limit, offset, total: content.length });
}
