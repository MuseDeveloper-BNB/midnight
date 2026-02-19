import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { IconBookmark } from '@/components/profile/ProfileIcons';

export default function SavedLoading() {
  return (
    <div className="profile-page">
      <section className="profile-section profile-section--card">
        <h2 className="profile-section__title">
          <IconBookmark size={24} className="profile-section__icon" />
          Saved
        </h2>
        <div className="page-loading" style={{ minHeight: 200 }}>
          <LoadingSpinner size="lg" />
          <p className="page-loading__text">Loading saved...</p>
        </div>
      </section>
    </div>
  );
}
