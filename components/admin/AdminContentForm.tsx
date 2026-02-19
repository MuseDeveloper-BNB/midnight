'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createContentAction } from '@/actions/content/create.action';
import { RichTextEditor } from '@/components/content/RichTextEditor';

type AdminContentFormProps = {
  contentType: 'NEWS' | 'BLOG';
};

export function AdminContentForm({ contentType }: AdminContentFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [body, setBody] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [publishNow, setPublishNow] = useState(true);
  const [scheduledAt, setScheduledAt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.set('type', contentType);
    formData.set('title', title);
    if (slug.trim()) formData.set('slug', slug.trim());
    formData.set('body', body || '');
    if (imageFile) formData.set('image', imageFile);
    if (publishNow) {
      formData.set('publishNow', 'on');
    } else if (scheduledAt.trim()) {
      formData.set('scheduledPublishAt', scheduledAt.trim());
    }

    startTransition(async () => {
      const result = await createContentAction(formData);
      if (result.success) {
        setSuccess('Content created successfully.');
        setTitle('');
        setSlug('');
        setBody('');
        setScheduledAt('');
        setImageFile(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
        router.refresh();
      } else {
        setError(result.error ?? 'Could not create content.');
      }
    });
  }

  return (
    <form className="admin-content-form" onSubmit={handleSubmit}>
      <div className="admin-content-form-header">
        <h2>{contentType === 'NEWS' ? 'Create News Article' : 'Create Blog Post'}</h2>
        <p>
          {contentType === 'NEWS'
            ? 'Publish concise, time-sensitive stories.'
            : 'Write in-depth blog articles with rich formatting.'}
        </p>
      </div>

      <div className="admin-content-field">
        <label htmlFor={`${contentType}-title`}>Title</label>
        <input
          id={`${contentType}-title`}
          name="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder={
            contentType === 'NEWS'
              ? 'Government announces new economic measures'
              : 'Behind the headlines: how we verify our sources'
          }
        />
      </div>

      <div className="admin-content-field">
        <label htmlFor={`${contentType}-slug`}>Slug (optional)</label>
        <input
          id={`${contentType}-slug`}
          name="slug"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="government-announces-new-economic-measures"
        />
        <span className="admin-content-hint">
          If empty, a slug will be generated from the title.
        </span>
      </div>

      <div className="admin-content-field">
        <label htmlFor={`${contentType}-image`}>Cover image (optional)</label>
        <input
          ref={imageInputRef}
          id={`${contentType}-image`}
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          aria-describedby={`${contentType}-image-hint`}
        />
        <span id={`${contentType}-image-hint`} className="admin-content-hint">
          JPEG, PNG, WebP or GIF. Max 5MB. Shown as the article cover on lists and detail page.
        </span>
      </div>

      <div className="admin-content-field">
        <label>Body</label>
        <RichTextEditor
          value={body}
          onChange={setBody}
          placeholder={
            contentType === 'NEWS'
              ? 'Write the full story. Keep it factual, clear and structured.'
              : 'Share a thoughtful analysis, background context, and your perspective.'
          }
        />
      </div>

      <div className="admin-content-field">
        <span className="admin-content-label">Publication</span>
        <div className="admin-content-publish-options">
          <label className="admin-content-radio">
            <input
              type="radio"
              name={`${contentType}-publish-mode`}
              value="now"
              checked={publishNow}
              onChange={() => setPublishNow(true)}
            />
            <span>Publish immediately</span>
          </label>
          <label className="admin-content-radio">
            <input
              type="radio"
              name={`${contentType}-publish-mode`}
              value="schedule"
              checked={!publishNow}
              onChange={() => setPublishNow(false)}
            />
            <span>Schedule for later</span>
          </label>
        </div>
        {!publishNow && (
          <div className="admin-content-schedule">
            <label htmlFor={`${contentType}-scheduledAt`}>Publish at</label>
            <input
              id={`${contentType}-scheduledAt`}
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
            <span className="admin-content-hint">
              Article will be automatically visible when this time is reached.
            </span>
          </div>
        )}
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

      <button type="submit" disabled={isPending} aria-busy={isPending}>
        {isPending ? 'Saving…' : 'Save content'}
      </button>
    </form>
  );
}

