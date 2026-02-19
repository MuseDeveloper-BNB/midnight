import { hideCommentFormAction } from '@/actions/comments/hide.action';
import { deleteCommentModerationFormAction } from '@/actions/comments/delete-moderation.action';

type CommentListProps = {
  comments: Array<{ id: string; body: string; authorName?: string; createdAt?: string }>;
  canModerate?: boolean;
  returnTo?: string;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function CommentList({ comments, canModerate = false, returnTo }: CommentListProps) {
  return (
    <div>
      <h3>Comments ({comments.length})</h3>
      {comments.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {comments.map((comment) => (
            <article key={comment.id} className="comment-item">
              <div className="comment-item-header">
                <span className="comment-author">{comment.authorName ?? 'Anonymous'}</span>
                {comment.createdAt && (
                  <span className="comment-date">{formatDate(comment.createdAt)}</span>
                )}
              </div>
              <p className="comment-body">{comment.body}</p>
              {canModerate && (
                <div className="comment-item-actions">
                  <form action={hideCommentFormAction} className="comment-mod-form">
                    <input type="hidden" name="id" value={comment.id} />
                    {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
                    <button type="submit">Hide</button>
                  </form>
                  <form action={deleteCommentModerationFormAction} className="comment-mod-form">
                    <input type="hidden" name="id" value={comment.id} />
                    {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
                    <button type="submit">Delete</button>
                  </form>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
