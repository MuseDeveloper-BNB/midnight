import Link from 'next/link';
import { contentService } from '@/services/content/content.service';

export const dynamic = 'force-dynamic';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusLabel(c: { status: string; scheduledPublishAt: Date | null }) {
  if (c.status === 'PUBLISHED') return 'Published';
  if (c.status === 'DRAFT' && c.scheduledPublishAt) return 'Scheduled';
  return 'Draft';
}

function getStatusClass(c: { status: string; scheduledPublishAt: Date | null }) {
  if (c.status === 'PUBLISHED') return 'admin-list-status--published';
  if (c.status === 'DRAFT' && c.scheduledPublishAt) return 'admin-list-status--scheduled';
  return 'admin-list-status--draft';
}

function getDisplayDate(c: { status: string; publishedAt: Date | null; scheduledPublishAt: Date | null }) {
  if (c.status === 'PUBLISHED' && c.publishedAt) return formatDate(c.publishedAt.toISOString());
  if (c.scheduledPublishAt) return formatDate(c.scheduledPublishAt.toISOString());
  return '—';
}

export default async function AdminNewsPage() {
  const items = await contentService.getContentForAdminList({
    type: 'NEWS',
    limit: 100,
    sort: 'newest',
  });

  return (
    <section className="admin-dashboard">
      <header className="admin-dashboard-header">
        <h1>News</h1>
        <p>News articles. Open to view, or edit via the link.</p>
        <Link href="/admin-news/archived" className="admin-archived-link">
          View archived
        </Link>
      </header>

      <div className="admin-dashboard-main">
        <div className="admin-users-card">
          {items.length === 0 ? (
            <p className="admin-list-empty">No news yet.</p>
          ) : (
            <ul className="admin-list">
              {items.map((c) => (
                <li key={c.id} className="admin-list-item">
                  <div className="admin-list-item-content">
                    <div className="admin-list-item-main">
                      <Link href={`/news/${c.slug}`} className="admin-list-item-title">
                        {c.title}
                      </Link>
                      <div className="admin-list-item-meta">
                        <span className={`admin-list-status ${getStatusClass(c)}`}>{getStatusLabel(c)}</span>
                        <span className="admin-list-meta-sep">·</span>
                        <span>{getDisplayDate(c)}</span>
                        <span className="admin-list-meta-sep">·</span>
                        <span>{c.blogAuthor ?? c.author?.name ?? c.author?.email ?? '—'}</span>
                      </div>
                    </div>
                    <div className="admin-list-item-actions">
                      <Link href={`/admin/content/${c.id}`} className="btn btn-outline btn-sm">
                        Edit
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
