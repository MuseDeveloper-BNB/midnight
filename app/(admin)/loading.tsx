import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminLoading() {
  return (
    <div className="page-loading">
      <LoadingSpinner size="lg" />
      <p className="page-loading__text">Loading...</p>
    </div>
  );
}
