import { NextResponse } from 'next/server';
import { contentService } from '@/services/content/content.service';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, context: { params: { slug: string } }) {
  const content = await contentService.getContentBySlug(context.params.slug);

  if (!content) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 });
  }

  return NextResponse.json({ content });
}
