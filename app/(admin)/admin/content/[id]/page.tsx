import Link from 'next/link';
import { publishContentAction } from '@/actions/content/publish.action';
import { unpublishContentAction } from '@/actions/content/unpublish.action';
import { archiveContentAction } from '@/actions/content/archive.action';
import { AdminContentEditForm } from '@/components/admin/AdminContentEditForm';
import { db } from '@/lib/db';

type PageProps = { params: Promise<{ id: string }> | { id: string } };

function statusLabel(s: string) {
  if (s === 'PUBLISHED') return 'Published';
  if (s === 'ARCHIVED') return 'Archived';
  return 'Draft';
}

export default async function AdminEditContentPage({ params }: PageProps) {
  const { id } = 'then' in params ? await params : params;
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
            }}
          />

          <div className="admin-edit-actions">
            <span className="admin-edit-actions-label">Status</span>
            <div className="admin-edit-actions-btns">
              <form action={publishContentAction}>
                <input type="hidden" name="id" value={content.id} />
                <button type="submit" className="admin-edit-btn admin-edit-btn--primary">
                  Publish
                </button>
              </form>
              <form action={unpublishContentAction}>
                <input type="hidden" name="id" value={content.id} />
                <button type="submit" className="admin-edit-btn admin-edit-btn--secondary">
                  Unpublish
                </button>
              </form>
              <form action={archiveContentAction}>
                <input type="hidden" name="id" value={content.id} />
                <button type="submit" className="admin-edit-btn admin-edit-btn--secondary">
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
