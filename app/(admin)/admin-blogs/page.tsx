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

export default async function AdminBlogsPage() {
  const items = await contentService.getPublishedContent({
    type: 'BLOG',
    limit: 100,
    sort: 'newest',
  });

  return (
    <section className="admin-dashboard">
      <header className="admin-dashboard-header">
        <h1>Blogs</h1>
        <p>Published blog posts. Open to view, or edit via the link.</p>
      </header>

      <div className="admin-dashboard-main">
        <div className="admin-users-card">
          {items.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>No published blogs yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {items.map((c) => (
                <li
                  key={c.id}
                  style={{
                    padding: 'var(--space-sm) 0',
                    borderBottom: '1px solid var(--color-border-light)',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-sm)', justifyContent: 'space-between' }}>
                    <div>
                      <Link href={`/blog/${c.slug}`} style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                        {c.title}
                      </Link>
                      <span style={{ marginLeft: 'var(--space-sm)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}>
                        {c.publishedAt && formatDate(c.publishedAt.toISOString())}
                        {' · '}
                        {c.blogAuthor ?? c.author?.name ?? c.author?.email ?? '—'}
                      </span>
                    </div>
                    <Link href={`/admin/content/${c.id}`} className="btn btn-outline" style={{ flexShrink: 0 }}>
                      Edit
                    </Link>
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
