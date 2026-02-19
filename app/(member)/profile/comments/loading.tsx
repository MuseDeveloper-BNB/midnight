import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { IconComments } from '@/components/profile/ProfileIcons';

export default function CommentsLoading() {
  return (
    <div className="profile-page">
      <section className="profile-section profile-section--card">
        <h2 className="profile-section__title">
          <IconComments size={24} className="profile-section__icon" />
          My comments
        </h2>
        <div className="page-loading" style={{ minHeight: 200 }}>
          <LoadingSpinner size="lg" />
          <p className="page-loading__text">Loading comments...</p>
        </div>
      </section>
    </div>
  );
}
