import Link from 'next/link';
import { updateUserRoleFormAction } from '@/actions/admin/update-role.action';

type UserListProps = {
  users: Array<{ id: string; email: string; role: string; active: boolean }>;
  canChangeRole?: boolean;
};

export function UserList({ users, canChangeRole = false }: UserListProps) {
  return (
    <table className="admin-users-table">
      <thead>
        <tr>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>
              <Link href={`/users/${user.id}`}>{user.email}</Link>
            </td>
            <td>
              {canChangeRole ? (
                <form action={updateUserRoleFormAction} className="admin-users-role-form">
                  <input type="hidden" name="userId" value={user.id} />
                  <select name="role" defaultValue={user.role}>
                    <option value="MEMBER">Member</option>
                    <option value="EDITOR">Editor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button type="submit">Save</button>
                </form>
              ) : (
                <span>{user.role}</span>
              )}
            </td>
            <td>
              <span
                className={
                  user.active
                    ? 'admin-users-status admin-users-status--active'
                    : 'admin-users-status admin-users-status--inactive'
                }
              >
                {user.active ? 'Active' : 'Deactivated'}
              </span>
            </td>
            <td>
              <Link href={`/users/${user.id}`}>Details</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
