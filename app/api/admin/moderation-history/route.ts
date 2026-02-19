import { NextResponse } from 'next/server';
import { adminService } from '@/services/admin/admin.service';
import { rateLimit } from '@/utils/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success } = await rateLimit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit') ?? 50);
  const offset = Number(searchParams.get('offset') ?? 0);
  const moderatorId = searchParams.get('moderatorId') ?? undefined;
  const action = searchParams.get('action') ?? undefined;
  const targetType = searchParams.get('targetType') ?? undefined;

  const logs = await adminService.getModerationHistory({
    limit,
    offset,
    moderatorId,
    action,
    targetType,
  });

  return NextResponse.json({ logs, limit, offset, total: logs.length });
}
