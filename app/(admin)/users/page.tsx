import { auth } from '@/lib/auth';
import { adminService } from '@/services/admin/admin.service';
import { UserList } from '@/components/admin/UserList';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const [users, session] = await Promise.all([
    adminService.getUsers({}),
    auth(),
  ]);
  const canChangeRole = (session?.user as { role?: string })?.role === 'ADMIN';
  return (
    <section className="admin-dashboard">
      <header className="admin-dashboard-header">
        <h1>Users</h1>
        <p>Manage roles and account status. Open a user to deactivate or activate.</p>
      </header>

      <div className="admin-dashboard-main">
        <div className="admin-users-card">
          <UserList users={users} canChangeRole={canChangeRole} />
        </div>
      </div>
    </section>
  );
}
