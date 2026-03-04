import Link from 'next/link';
import { updateContentFormAction } from '@/actions/content/update.action';
import { publishContentAction } from '@/actions/content/publish.action';
import { unpublishContentAction } from '@/actions/content/unpublish.action';
import { archiveContentAction } from '@/actions/content/archive.action';
import { ContentEditor } from '@/components/content/ContentEditor';
import { db } from '@/lib/db';

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
  searchParams?: Promise<{ success?: string }> | { success?: string };
};

export default async function EditContentPage({ params, searchParams }: PageProps) {
  const { id } = 'then' in params ? await params : params;
  const resolvedSearch = searchParams ? ('then' in searchParams ? await searchParams : searchParams) : {};
  const success = resolvedSearch.success;
  const content = await db.content.findUnique({ where: { id } });
  if (!content) {
    return <p>Content not found</p>;
  }

  const base = content.type === 'NEWS' ? 'news' : 'blog';
  const viewHref = `/${base}/${content.slug}`;
  const returnTo = `/content/${content.id}`;

  return (
    <section>
      <p style={{ marginBottom: 'var(--space-md)' }}>
        <Link href={viewHref}>← View {content.type === 'NEWS' ? 'article' : 'post'}</Link>
      </p>
      <h1>Edit Content</h1>
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
      <ContentEditor
        initialValues={{
          id: content.id,
          type: content.type,
          title: content.title,
          body: content.body,
          slug: content.slug,
        }}
        onSubmit={updateContentFormAction}
      />
      <form action={publishContentAction} style={{ display: 'inline' }}>
        <input type="hidden" name="id" value={content.id} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <button
          type="submit"
          className={`admin-edit-btn ${content.status === 'PUBLISHED' ? 'admin-edit-btn--primary' : 'admin-edit-btn--secondary'}`}
        >
          Publish
        </button>
      </form>
      <form action={unpublishContentAction} style={{ display: 'inline' }}>
        <input type="hidden" name="id" value={content.id} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <button
          type="submit"
          className={`admin-edit-btn ${content.status === 'DRAFT' ? 'admin-edit-btn--primary' : 'admin-edit-btn--secondary'}`}
        >
          Unpublish
        </button>
      </form>
      <form action={archiveContentAction} style={{ display: 'inline' }}>
        <input type="hidden" name="id" value={content.id} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <button
          type="submit"
          className={`admin-edit-btn ${content.status === 'ARCHIVED' ? 'admin-edit-btn--primary' : 'admin-edit-btn--secondary'}`}
        >
          Archive
        </button>
      </form>
    </section>
  );
}
