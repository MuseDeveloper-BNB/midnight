import { auth } from '@/lib/auth';
import ProfileEditSection from '@/components/profile/ProfileEditSection';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <div className="profile-page">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  const user = session.user as { id?: string; name?: string | null; email?: string | null };
  const name = user.name ?? null;
  const email = user.email ?? '';
  const userId = user.id;

  if (!userId) {
    return (
      <div className="profile-page">
        <p>Unable to load profile.</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <ProfileEditSection name={name} email={email} />
    </div>
  );
}
