import { auth } from '@/lib/auth';
import { ProfileNav } from '@/components/profile/ProfileNav';

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="profile-layout">
      {session?.user && <ProfileNav />}
      <div className="profile-layout__content">{children}</div>
    </div>
  );
}
