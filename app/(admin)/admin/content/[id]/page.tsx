import Link from 'next/link';
import { publishContentAction } from '@/actions/content/publish.action';
import { unpublishContentAction } from '@/actions/content/unpublish.action';
import { archiveContentAction } from '@/actions/content/archive.action';
import { AdminContentEditForm } from '@/components/admin/AdminContentEditForm';
import { db } from '@/lib/db';

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
  searchParams?: Promise<{ success?: string }> | { success?: string };
};

function statusLabel(s: string) {
  if (s === 'PUBLISHED') return 'Published';
  if (s === 'ARCHIVED') return 'Archived';
  return 'Draft';
}

function formatScheduledDate(d: Date) {
  return new Date(d).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default async function AdminEditContentPage({ params, searchParams }: PageProps) {
  const { id } = 'then' in params ? await params : params;
  const resolvedSearch = searchParams ? ('then' in searchParams ? await searchParams : searchParams) : {};
  const success = resolvedSearch.success;
  const content = await db.content.findUnique({ where: { id } });
  if (!content) {
    return (
      <section className="admin-dashboard admin-edit">
        <div className="admin-edit-notfound">
          <p>Content not found.</p>
          <Link href="/admin-dashboard" className="admin-edit-back">← Dashboard</Link>
        </div>
      </section>
    );
  }

  const base = content.type === 'NEWS' ? 'news' : 'blog';
  const viewHref = `/${base}/${content.slug}`;
  const listHref = content.type === 'NEWS' ? '/admin-news' : '/admin-blogs';
  const isPublished = content.status === 'PUBLISHED';

  return (
    <section className="admin-dashboard admin-edit">
      <header className="admin-dashboard-header admin-edit-header">
        <div className="admin-edit-header-top">
          <h1>Edit {content.type === 'NEWS' ? 'news article' : 'blog post'}</h1>
          <span className={`admin-edit-status admin-edit-status--${content.status.toLowerCase()}`}>
            {statusLabel(content.status)}
          </span>
          {content.status === 'DRAFT' && content.scheduledPublishAt && (
            <span className="admin-edit-scheduled" style={{ marginLeft: 'var(--space-sm)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}>
              Scheduled for {formatScheduledDate(content.scheduledPublishAt)}
            </span>
          )}
        </div>
        <nav className="admin-edit-nav" aria-label="Edit page links">
          {isPublished && (
            <Link href={viewHref} className="admin-edit-link">
              View {content.type === 'NEWS' ? 'article' : 'post'}
            </Link>
          )}
          <Link href={listHref} className="admin-edit-link">
            ← {content.type === 'NEWS' ? 'News' : 'Blogs'}
          </Link>
        </nav>
      </header>

      <div className="admin-dashboard-main admin-edit-main">
        <div className="admin-edit-card">
          <AdminContentEditForm
            initialValues={{
              id: content.id,
              type: content.type,
              title: content.title,
              body: content.body,
              slug: content.slug,
              blogAuthor: content.blogAuthor,
              imageUrl: content.imageUrl,
              publishedAt: content.publishedAt,
              scheduledPublishAt: content.scheduledPublishAt,
              status: content.status,
            }}
          />

          {success === 'published' && (
            <p className="msg-success" role="status">
              Content published successfully.
            </p>
          )}
          {success === 'archived' && (
            <p className="msg-success" role="status">
              Content archived successfully.
            </p>
          )}
          {success === 'unpublished' && (
            <p className="msg-success" role="status">
              Content unpublished successfully.
            </p>
          )}
          <div className="admin-edit-actions">
            <span className="admin-edit-actions-label">Status</span>
            <div className="admin-edit-actions-btns">
              <form action={publishContentAction}>
                <input type="hidden" name="id" value={content.id} />
                <input type="hidden" name="returnTo" value={`/admin/content/${content.id}`} />
                <button
                  type="submit"
                  className={`admin-edit-btn ${content.status === 'PUBLISHED' ? 'admin-edit-btn--primary' : 'admin-edit-btn--secondary'}`}
                >
                  Publish
                </button>
              </form>
              <form action={unpublishContentAction}>
                <input type="hidden" name="id" value={content.id} />
                <input type="hidden" name="returnTo" value={`/admin/content/${content.id}`} />
                <button
                  type="submit"
                  className={`admin-edit-btn ${content.status === 'DRAFT' ? 'admin-edit-btn--primary' : 'admin-edit-btn--secondary'}`}
                >
                  Unpublish
                </button>
              </form>
              <form action={archiveContentAction}>
                <input type="hidden" name="id" value={content.id} />
                <input type="hidden" name="returnTo" value={`/admin/content/${content.id}`} />
                <button
                  type="submit"
                  className={`admin-edit-btn ${content.status === 'ARCHIVED' ? 'admin-edit-btn--primary' : 'admin-edit-btn--secondary'}`}
                >
                  Archive
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
