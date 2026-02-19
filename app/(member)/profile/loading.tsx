import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProfileLoading() {
  return (
    <div className="profile-page">
      <div className="page-loading" style={{ minHeight: 300 }}>
        <LoadingSpinner size="lg" />
        <p className="page-loading__text">Loading profile...</p>
      </div>
    </div>
  );
}
