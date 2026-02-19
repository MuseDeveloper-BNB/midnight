import { adminService } from '@/services/admin/admin.service';
import { ModerationHistory } from '@/components/admin/ModerationHistory';

export const dynamic = 'force-dynamic';

export default async function ModerationHistoryPage() {
  const logs = await adminService.getModerationHistory({});
  return (
    <section>
      <h1>Moderation History</h1>
      <ModerationHistory logs={logs} />
    </section>
  );
}
