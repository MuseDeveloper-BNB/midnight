'use client';

import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { format } from 'date-fns';
import { unsaveContentAction } from '@/actions/saved/unsave.action';

type SavedItem = {
  id: string;
  contentId: string;
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

type SavedListProps = {
  items: SavedItem[];
  total: number;
  page: number;
  pageSize: number;
  isLoading?: boolean;
};

export function SavedList({
  items,
  total,
  page,
  pageSize,
  isLoading = false,
}: SavedListProps) {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const hasMore = page * pageSize < total;
  const nextPage = page + 1;
  const q = new URLSearchParams({ savedPage: String(nextPage) });

  async function handleUnsave(contentId: string) {
    setError(null);
    setRemovingId(contentId);
    startTransition(async () => {
      const result = await unsaveContentAction({ contentId });
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? 'Could not remove. Please try again.');
      }
      setRemovingId(null);
    });
  }

  if (isLoading) {
    return (
      <div className="saved-list page-loading" aria-label="Saved loading" style={{ minHeight: 160 }}>
        <LoadingSpinner size="md" />
        <p className="page-loading__text">Loading saved...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="saved-list saved-list-empty" role="status">
        <p>No saved articles yet.</p>
      </div>
    );
  }

  return (
    <div className="saved-list" aria-labelledby="saved-heading">
      {error && (
        <p className="msg-error" role="alert">
          {error}
        </p>
      )}
      <ul className="saved-list-items">
        {items.map((item) => {
          const href = item.content?.type === 'BLOG'
            ? `/blog/${item.content.slug}`
            : `/news/${item.content?.slug ?? '#'}`;
          const label = item.content?.title ?? 'Article';
          const unavailable = !item.content || item.content.status !== 'PUBLISHED';
          const isRemoving = removingId === item.contentId || isPending;

          return (
            <li key={item.id} className="saved-list-item">
              <div className="saved-list-item-main">
                {unavailable ? (
                  <span className="saved-list-item-title">Article no longer available</span>
                ) : (
                  <Link
                    href={href}
                    className="saved-list-item-link"
                    aria-label={`View article: ${label}`}
                  >
                    {label}
                  </Link>
                )}
                <p className="saved-list-item-meta">
                  <span className="saved-list-item-type">
                    {item.content?.type === 'BLOG' ? 'Blog' : 'News'}
                  </span>
                  {item.content?.publishedAt && (
                    <>
                      {' · '}
                      <time dateTime={new Date(item.content.publishedAt).toISOString()}>
                        {format(new Date(item.content.publishedAt), 'MMM d, yyyy')}
                      </time>
                    </>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleUnsave(item.contentId)}
                disabled={isRemoving}
                aria-busy={isRemoving}
                aria-label={`Remove "${label}" from saved`}
                className="saved-list-item-remove"
              >
                {isRemoving ? 'Removing…' : 'Remove'}
              </button>
            </li>
          );
        })}
      </ul>
      {hasMore && (
        <p className="saved-list-load-more">
          <Link
            href={`/profile/saved?${q.toString()}`}
            className="btn btn-outline"
            aria-label={`Load more saved articles, page ${nextPage}`}
          >
            Load more
          </Link>
        </p>
      )}
    </div>
  );
}
