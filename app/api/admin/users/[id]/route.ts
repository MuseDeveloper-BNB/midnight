import { NextResponse } from 'next/server';
import { adminService } from '@/services/admin/admin.service';
import { rateLimit } from '@/utils/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: { id: string } }) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success } = await rateLimit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  const user = await adminService.getUser(context.params.id);
  return NextResponse.json({ user });
}
