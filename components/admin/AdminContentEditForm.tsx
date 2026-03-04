'use client';

import React, { useState, useTransition, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { updateContentAction } from '@/actions/content/update.action';
import { RichTextEditor } from '@/components/content/RichTextEditor';

function toDatetimeLocal(d: Date | string | null | undefined): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type AdminContentEditFormProps = {
  initialValues: {
    id: string;
    type: 'NEWS' | 'BLOG';
    title: string;
    body: string;
    slug: string;
    blogAuthor?: string | null;
    imageUrl?: string | null;
    publishedAt?: Date | string | null;
    scheduledPublishAt?: Date | string | null;
    status?: string;
  };
};

export function AdminContentEditForm({ initialValues }: AdminContentEditFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialValues.title);
  const [slug, setSlug] = useState(initialValues.slug);
  const [body, setBody] = useState(initialValues.body || '');
  const [blogAuthor, setBlogAuthor] = useState(initialValues.blogAuthor ?? '');
  const [publishedAt, setPublishedAt] = useState(toDatetimeLocal(initialValues.publishedAt ?? null));
  const [scheduledPublishAt, setScheduledPublishAt] = useState(toDatetimeLocal(initialValues.scheduledPublishAt ?? null));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const imageInputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.set('id', initialValues.id);
    formData.set('title', title.trim());
    formData.set('body', body.trim() || '<p></p>');
    if (slug.trim()) formData.set('slug', slug.trim());
    formData.set('blogAuthor', blogAuthor.trim());
    if (removeImage) formData.set('removeImage', 'on');
    if (imageFile) formData.set('image', imageFile);
    if (publishedAt.trim()) formData.set('publishedAt', publishedAt.trim());
    formData.set('scheduledPublishAt', scheduledPublishAt.trim());

    startTransition(async () => {
      const result = await updateContentAction(formData);
      if (result.success) {
        setSuccess('Changes saved.');
        setImageFile(null);
        setRemoveImage(false);
        if (imageInputRef.current) imageInputRef.current.value = '';
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
          placeholder={
            initialValues.type === 'NEWS'
              ? 'Headline for the news article'
              : 'Title of the blog post'
          }
        />
      </div>

      <div className="admin-content-field">
        <label htmlFor="edit-image">Cover image</label>
        {initialValues.imageUrl && !removeImage && (
          <div className="admin-edit-image-preview" style={{ marginBottom: 'var(--space-sm)' }}>
            <Image
              src={initialValues.imageUrl}
              alt="Current cover"
              width={200}
              height={112}
              style={{ borderRadius: 8, objectFit: 'cover' }}
              unoptimized
            />
          </div>
        )}
        <input
          ref={imageInputRef}
          id="edit-image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => {
            setImageFile(e.target.files?.[0] ?? null);
            setRemoveImage(false);
          }}
          aria-describedby="edit-image-hint"
        />
        <span id="edit-image-hint" className="admin-content-hint">
          JPEG, PNG, WebP or GIF. Max 10MB. Recommended: 1200×675px (16:9).
        </span>
        {initialValues.imageUrl && (
          <label className="admin-content-checkbox" style={{ display: 'block', marginTop: 'var(--space-xs)' }}>
            <input
              type="checkbox"
              checked={removeImage}
              onChange={(e) => {
                setRemoveImage(e.target.checked);
                if (e.target.checked) {
                  setImageFile(null);
                  if (imageInputRef.current) imageInputRef.current.value = '';
                }
              }}
            />
            <span>Remove current image</span>
          </label>
        )}
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
            initialValues.type === 'NEWS'
              ? 'Write the full story. Use headings, lists and links for structure.'
              : 'Share your analysis and perspective. Format with headings, lists and links.'
          }
        />
      </div>

      <div className="admin-content-field">
        <label htmlFor="edit-blog-author">Author name (optional)</label>
        <input
          id="edit-blog-author"
          name="blogAuthor"
          type="text"
          value={blogAuthor}
          onChange={(e) => setBlogAuthor(e.target.value)}
          maxLength={120}
          placeholder="e.g. John Smith"
        />
      </div>

      <div className="admin-content-field">
        <label htmlFor="edit-published-at">Published date (optional)</label>
        <input
          id="edit-published-at"
          name="publishedAt"
          type="datetime-local"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
        />
        <span className="admin-content-hint">
          Change to backdate the article. Only applies to published content.
        </span>
      </div>

      {(initialValues.status === 'DRAFT' || initialValues.scheduledPublishAt) && (
        <div className="admin-content-field">
          <label htmlFor="edit-scheduled-at">Scheduled publish date (optional)</label>
          <input
            id="edit-scheduled-at"
            name="scheduledPublishAt"
            type="datetime-local"
            value={scheduledPublishAt}
            onChange={(e) => setScheduledPublishAt(e.target.value)}
          />
          <span className="admin-content-hint">
            When the article will be published automatically. Leave empty to remove schedule.
          </span>
        </div>
      )}

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
