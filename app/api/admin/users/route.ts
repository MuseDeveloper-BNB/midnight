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
  const role = searchParams.get('role') ?? undefined;
  const active = searchParams.get('active');
  const search = searchParams.get('search') ?? undefined;

  const users = await adminService.getUsers({
    limit,
    offset,
    role: role ?? undefined,
    active: active ? active === 'true' : undefined,
    search,
  });

  return NextResponse.json({ users, limit, offset, total: users.length });
}
