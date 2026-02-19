'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateContentAction } from '@/actions/content/update.action';
import { RichTextEditor } from '@/components/content/RichTextEditor';

type AdminContentEditFormProps = {
  initialValues: {
    id: string;
    type: 'NEWS' | 'BLOG';
    title: string;
    body: string;
    slug: string;
  };
};

export function AdminContentEditForm({ initialValues }: AdminContentEditFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialValues.title);
  const [slug, setSlug] = useState(initialValues.slug);
  const [body, setBody] = useState(initialValues.body || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isNews = initialValues.type === 'NEWS';

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.set('id', initialValues.id);
    formData.set('title', title.trim());
    formData.set('body', body.trim() || '<p></p>');
    if (slug.trim()) formData.set('slug', slug.trim());

    startTransition(async () => {
      const result = await updateContentAction(formData);
      if (result.success) {
        setSuccess('Changes saved.');
        router.refresh();
      } else {
        setError(result.error ?? 'Could not save.');
      }
    });
  }

  return (
    <form className="admin-content-form admin-edit-form" onSubmit={handleSubmit}>
      <div className="admin-content-field">
        <label htmlFor="edit-title">Title</label>
        <input
          id="edit-title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder={isNews ? 'Headline for the news article' : 'Title of the blog post'}
        />
      </div>

      <div className="admin-content-field">
        <label htmlFor="edit-slug">Slug (optional)</label>
        <input
          id="edit-slug"
          name="slug"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="url-friendly-slug"
        />
        <span className="admin-content-hint">Used in the URL. Leave empty to generate from title.</span>
      </div>

      <div className="admin-content-field">
        <label htmlFor="edit-body">Body</label>
        <RichTextEditor
          value={body}
          onChange={setBody}
          placeholder={
            isNews
              ? 'Write the full story. Use headings, lists and links for structure.'
              : 'Share your analysis and perspective. Format with headings, lists and links.'
          }
        />
      </div>

      {error && (
        <p className="msg-error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="msg-success" role="status">
          {success}
        </p>
      )}

      <button type="submit" disabled={isPending} className="admin-edit-save" aria-busy={isPending}>
        {isPending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
