import { auth } from '@/lib/auth';
import { savedService } from '@/services/saved/saved.service';
import { SavedList } from '@/components/profile/SavedList';
import { IconBookmark } from '@/components/profile/ProfileIcons';

type SavedPageProps = {
  searchParams?: Promise<{ savedPage?: string }> | { savedPage?: string };
};

export default async function ProfileSavedPage({ searchParams: rawSearchParams }: SavedPageProps) {
  const session = await auth();
  if (!session?.user) {
    return (
      <div className="profile-page">
        <p>Please log in to view your saved articles.</p>
      </div>
    );
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return (
      <div className="profile-page">
        <p>Unable to load saved articles.</p>
      </div>
    );
  }

  const searchParams = rawSearchParams && 'then' in rawSearchParams
    ? await rawSearchParams
    : rawSearchParams ?? {};
  const savedPage = Math.max(1, parseInt(String(searchParams?.savedPage ?? '1'), 10) || 1);

  let saved = { items: [] as Awaited<ReturnType<typeof savedService.listSaved>>['items'], total: 0, page: 1, pageSize: 15 };
  try {
    saved = await savedService.listSaved(userId, { page: savedPage, pageSize: 15 });
  } catch {
    saved = { ...saved, page: savedPage };
  }

  return (
    <div className="profile-page">
      <section className="profile-section profile-section--card" aria-labelledby="saved-heading">
        <h2 id="saved-heading" className="profile-section__title">
          <IconBookmark size={24} className="profile-section__icon" />
          Saved
        </h2>
        <SavedList
          items={saved.items}
          total={saved.total}
          page={saved.page}
          pageSize={saved.pageSize}
        />
      </section>
    </div>
  );
}
