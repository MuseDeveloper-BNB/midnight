import Link from 'next/link';

type ArticleCardProps = {
  variant?: 'default' | 'lead';
  title: string;
  slug: string;
  authorName?: string | null;
  publishedAt?: string | null;
};

export function ArticleCard({ variant = 'default', title, slug, authorName, publishedAt }: ArticleCardProps) {
  const isLead = variant === 'lead';
  return (
    <article
      style={{
        padding: isLead ? 'var(--space-lg)' : 0,
        marginBottom: isLead ? 0 : undefined,
      }}
    >
      <h2
        style={{
          fontSize: isLead ? 'var(--text-size-lead)' : 'var(--text-size-h3)',
          lineHeight: 'var(--line-height-heading)',
          marginTop: 0,
          marginBottom: 'var(--space-xs)',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        }}
      >
        <Link href={slug} style={{ color: 'var(--color-text)', textDecoration: 'none' }}>
          {title}
        </Link>
      </h2>
      <p style={{ fontSize: 'var(--text-size-small)', color: 'var(--color-text-muted)', margin: 0 }}>
        {authorName ?? 'Unknown author'} · {publishedAt ? new Date(publishedAt).toLocaleDateString() : 'Unpublished'}
      </p>
    </article>
  );
}
