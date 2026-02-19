import Link from 'next/link';
import { updateContentFormAction } from '@/actions/content/update.action';
import { publishContentAction } from '@/actions/content/publish.action';
import { unpublishContentAction } from '@/actions/content/unpublish.action';
import { archiveContentAction } from '@/actions/content/archive.action';
import { ContentEditor } from '@/components/content/ContentEditor';
import { db } from '@/lib/db';

type PageProps = { params: Promise<{ id: string }> | { id: string } };

export default async function EditContentPage({ params }: PageProps) {
  const { id } = 'then' in params ? await params : params;
  const content = await db.content.findUnique({ where: { id } });
  if (!content) {
    return <p>Content not found</p>;
  }

  const base = content.type === 'NEWS' ? 'news' : 'blog';
  const viewHref = `/${base}/${content.slug}`;

  return (
    <section>
      <p style={{ marginBottom: 'var(--space-md)' }}>
        <Link href={viewHref}>← View {content.type === 'NEWS' ? 'article' : 'post'}</Link>
      </p>
      <h1>Edit Content</h1>
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
      <form action={publishContentAction}>
        <input type="hidden" name="id" value={content.id} />
        <button type="submit">Publish</button>
      </form>
      <form action={unpublishContentAction}>
        <input type="hidden" name="id" value={content.id} />
        <button type="submit">Unpublish</button>
      </form>
      <form action={archiveContentAction}>
        <input type="hidden" name="id" value={content.id} />
        <button type="submit">Archive</button>
      </form>
    </section>
  );
}
