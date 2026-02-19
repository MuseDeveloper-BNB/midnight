'use client';

import { useState, useTransition } from 'react';
import { saveContentAction } from '@/actions/saved/save.action';
import { unsaveContentAction } from '@/actions/saved/unsave.action';

type SaveButtonProps = {
  contentId: string;
  initialSaved: boolean;
};

export function SaveButton({ contentId, initialSaved }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveContentAction({ contentId });
      if (result.success) {
        setSaved(true);
      } else {
        setError(result.error ?? 'Could not save. Please try again.');
      }
    });
  }

  async function handleUnsave() {
    setError(null);
    startTransition(async () => {
      const result = await unsaveContentAction({ contentId });
      if (result.success) {
        setSaved(false);
      } else {
        setError(result.error ?? 'Could not remove from saved. Please try again.');
      }
    });
  }

  function handleClick() {
    if (saved) {
      handleUnsave();
    } else {
      handleSave();
    }
  }

  return (
    <div className="save-button-wrap" role="group" aria-label="Save article">
      {error && (
        <div className="save-button-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => (saved ? handleUnsave() : handleSave())}
            className="save-button-retry"
            aria-label="Retry"
          >
            Retry
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-busy={isPending}
        aria-pressed={saved}
        aria-label={saved ? 'Remove from saved' : 'Save article'}
        className="btn save-button"
      >
        {isPending ? '…' : saved ? 'Unsave' : 'Save'}
      </button>
    </div>
  );
}
