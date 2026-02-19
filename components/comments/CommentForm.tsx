'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createCommentAction } from '@/actions/comments/create.action';

type CommentFormProps = {
  contentId: string;
};

export function CommentForm({ contentId }: CommentFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set('contentId', contentId);
    startTransition(async () => {
      const result = await createCommentAction(formData);
      if (result.success) {
        form.reset();
        router.refresh();
      } else {
        setError(result.error ?? 'Could not post comment.');
      }
    });
  }

  return (
    <form
      className="comment-form"
      onSubmit={handleSubmit}
      aria-label="Leave a comment"
    >
      <label htmlFor="comment-body">Leave a comment</label>
      <textarea
        id="comment-body"
        name="body"
        required
        placeholder="Write your comment..."
        disabled={isPending}
        aria-describedby={error ? 'comment-error' : undefined}
      />
      <input type="hidden" name="contentId" value={contentId} />
      {error && (
        <p id="comment-error" className="msg-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" disabled={isPending} aria-busy={isPending}>
        {isPending ? 'Posting…' : 'Post'}
      </button>
    </form>
  );
}
