import { auth } from '@/lib/auth';
import { profileService } from '@/services/profile/profile.service';
import { CommentsHistory } from '@/components/profile/CommentsHistory';
import { IconComments } from '@/components/profile/ProfileIcons';

type CommentsPageProps = {
  searchParams?: Promise<{ commentsPage?: string }> | { commentsPage?: string };
};

export default async function ProfileCommentsPage({ searchParams: rawSearchParams }: CommentsPageProps) {
  const session = await auth();
  if (!session?.user) {
    return (
      <div className="profile-page">
        <p>Please log in to view your comments.</p>
      </div>
    );
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return (
      <div className="profile-page">
        <p>Unable to load comments.</p>
      </div>
    );
  }

  const searchParams = rawSearchParams && 'then' in rawSearchParams
    ? await rawSearchParams
    : rawSearchParams ?? {};
  const commentsPage = Math.max(1, parseInt(String(searchParams?.commentsPage ?? '1'), 10) || 1);

  let comments = { items: [] as Awaited<ReturnType<typeof profileService.getCommentsByUserId>>['items'], total: 0, page: 1, pageSize: 15 };
  try {
    comments = await profileService.getCommentsByUserId(userId, { page: commentsPage, pageSize: 15 });
  } catch {
    comments = { ...comments, page: commentsPage };
  }

  return (
    <div className="profile-page">
      <section className="profile-section profile-section--card" aria-labelledby="comments-heading">
        <h2 id="comments-heading" className="profile-section__title">
          <IconComments size={24} className="profile-section__icon" />
          My comments
        </h2>
        <CommentsHistory
          items={comments.items}
          total={comments.total}
          page={comments.page}
          pageSize={comments.pageSize}
        />
      </section>
    </div>
  );
}
