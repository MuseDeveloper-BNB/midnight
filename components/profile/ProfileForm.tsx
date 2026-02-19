'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfileAction } from '@/actions/profile/update-profile.action';

type ProfileFormProps = {
  initialName: string | null;
  initialEmail: string;
  onSuccess?: () => void;
};

export function ProfileForm({
  initialName,
  initialEmail,
  onSuccess,
}: ProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await updateProfileAction(formData);
      if (result.success) {
        setSuccess(true);
        router.refresh();
        onSuccess?.();
      } else {
        setError(result.error ?? 'Something went wrong.');
      }
    });
  }

  return (
    <form
      action={handleSubmit}
      className="profile-form"
      aria-label="Edit profile"
      noValidate
    >
      <div className="profile-form-field">
        <label htmlFor="profile-name">Display name</label>
        <input
          id="profile-name"
          name="name"
          type="text"
          defaultValue={initialName ?? ''}
          autoComplete="name"
          maxLength={255}
          placeholder="Your display name"
          aria-describedby="profile-name-hint"
        />
        <span id="profile-name-hint" className="profile-form-hint">
          Optional. At least one of name or email is required.
        </span>
      </div>
      <div className="profile-form-field">
        <label htmlFor="profile-email">Email</label>
        <input
          id="profile-email"
          name="email"
          type="email"
          defaultValue={initialEmail}
          autoComplete="email"
          maxLength={255}
          placeholder="you@example.com"
          aria-describedby="profile-email-hint"
        />
        <span id="profile-email-hint" className="profile-form-hint">
          Optional. Must be unique if changed.
        </span>
      </div>
      {error && (
        <p className="msg-error" role="alert" id="profile-error">
          {error}
        </p>
      )}
      {success && (
        <p className="msg-success" role="status" id="profile-success">
          Profile updated.
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        aria-describedby={error ? 'profile-error' : success ? 'profile-success' : undefined}
      >
        {isPending ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}
