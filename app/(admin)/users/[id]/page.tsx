import Link from 'next/link';
import { auth } from '@/lib/auth';
import { adminService } from '@/services/admin/admin.service';
import { updateUserRoleFormAction } from '@/actions/admin/update-role.action';
import { deactivateUserFormAction } from '@/actions/admin/deactivate-user.action';
import { activateUserFormAction } from '@/actions/admin/activate-user.action';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ id: string }> | { id: string } };

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = 'then' in params ? await params : params;
  const [user, session] = await Promise.all([
    adminService.getUser(id),
    auth(),
  ]);
  const canChangeRole = (session?.user as { role?: string })?.role === 'ADMIN';
  return (
    <section>
      <p>
        <Link href="/users">← Users</Link>
      </p>
      <h1>User detail</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      {canChangeRole && (
        <form action={updateUserRoleFormAction}>
          <input type="hidden" name="userId" value={user.id} />
          <select name="role" defaultValue={user.role}>
            <option value="MEMBER">Member</option>
            <option value="EDITOR">Editor</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit">Update role</button>
        </form>
      )}
      <form action={user.active ? deactivateUserFormAction : activateUserFormAction}>
        <input type="hidden" name="userId" value={user.id} />
        <button type="submit">{user.active ? 'Deactivate' : 'Activate'}</button>
      </form>
    </section>
  );
}
