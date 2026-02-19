import Link from 'next/link';
import { format } from 'date-fns';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const EXCERPT_LEN = 120;

type CommentItem = {
  id: string;
  body: string;
  createdAt: Date;
  content: {
    id: string;
    title: string;
    type: string;
    slug: string;
    status: string;
    publishedAt: Date | null;
  } | null;
};

type CommentsHistoryProps = {
  items: CommentItem[];
  total: number;
  page: number;
  pageSize: number;
  isLoading?: boolean;
};

function excerpt(s: string, max = EXCERPT_LEN) {
  const t = s.trim();
  if (t.length <= max) return t;
  return t.slice(0, max).trimEnd() + '…';
}

export function CommentsHistory({
  items,
  total,
  page,
  pageSize,
  isLoading = false,
}: CommentsHistoryProps) {
  const hasMore = page * pageSize < total;
  const nextPage = page + 1;
  const q = new URLSearchParams({ commentsPage: String(nextPage) });

  if (isLoading) {
    return (
      <div className="comments-history page-loading" aria-label="My comments loading" style={{ minHeight: 160 }}>
        <LoadingSpinner size="md" />
        <p className="page-loading__text">Loading comments...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="comments-history comments-history-empty" role="status">
        <p>You haven&apos;t commented yet.</p>
      </div>
    );
  }

  return (
    <div className="comments-history" aria-labelledby="comments-heading">
      <ul className="comments-history-list">
        {items.map((c) => {
          const href = c.content?.type === 'BLOG'
            ? `/blog/${c.content.slug}`
            : `/news/${c.content?.slug ?? '#'}`;
          const label = c.content?.title ?? 'Article';
          return (
            <li key={c.id} className="comments-history-item">
              <p className="comments-history-excerpt">{excerpt(c.body)}</p>
              <p className="comments-history-meta">
                <time dateTime={c.createdAt.toISOString()}>
                  {format(c.createdAt, 'MMM d, yyyy')}
                </time>
                {c.content && (
                  <>
                    {' · '}
                    <Link
                      href={href}
                      className="comments-history-link"
                      aria-label={`View article: ${label}`}
                    >
                      {label}
                    </Link>
                  </>
                )}
              </p>
            </li>
          );
        })}
      </ul>
      {hasMore && (
        <p className="comments-history-load-more">
          <Link
            href={`/profile/comments?${q.toString()}`}
            className="btn btn-outline"
            aria-label={`Load more comments, page ${nextPage}`}
          >
            Load more
          </Link>
        </p>
      )}
    </div>
  );
}
