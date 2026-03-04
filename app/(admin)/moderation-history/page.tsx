import { adminService } from '@/services/admin/admin.service';
import { ModerationHistory } from '@/components/admin/ModerationHistory';

export const dynamic = 'force-dynamic';

export default async function ModerationHistoryPage() {
  const logs = await adminService.getModerationHistory({});
  return (
    <section className="admin-dashboard">
      <header className="admin-dashboard-header">
        <h1>Moderation history</h1>
        <p>Audit log of moderation actions: publish, unpublish, archive, role changes, and more.</p>
      </header>

      <div className="admin-dashboard-main">
        <div className="admin-users-card">
          <ModerationHistory logs={logs} />
        </div>
      </div>
    </section>
  );
}
