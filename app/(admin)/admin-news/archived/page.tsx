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

function getDisplayDate(c: { publishedAt: Date | null; scheduledPublishAt: Date | null }) {
  if (c.publishedAt) return formatDate(c.publishedAt.toISOString());
  if (c.scheduledPublishAt) return formatDate(c.scheduledPublishAt.toISOString());
  return '—';
}

export default async function AdminNewsArchivedPage() {
  const items = await contentService.getArchivedContent({
    type: 'NEWS',
    limit: 100,
    sort: 'newest',
  });

  return (
    <section className="admin-dashboard">
      <header className="admin-dashboard-header">
        <h1>Archived News</h1>
        <p>Archived news articles. Edit to restore or change status.</p>
        <Link href="/admin-news" className="admin-archived-link">
          ← Back to News
        </Link>
      </header>

      <div className="admin-dashboard-main">
        <div className="admin-users-card">
          {items.length === 0 ? (
            <p className="admin-list-empty">No archived news.</p>
          ) : (
            <ul className="admin-list">
              {items.map((c) => (
                <li key={c.id} className="admin-list-item">
                  <div className="admin-list-item-content">
                    <div className="admin-list-item-main">
                      <Link href={`/admin/content/${c.id}`} className="admin-list-item-title">
                        {c.title}
                      </Link>
                      <div className="admin-list-item-meta">
                        <span className="admin-list-status admin-list-status--archived">Archived</span>
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
