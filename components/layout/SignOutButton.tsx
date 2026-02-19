'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { signOutAction } from '@/actions/auth/signout.action';

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className = 'header-auth-link' }: SignOutButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
        aria-label="Sign out"
      >
        Sign out
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="signout-modal">
          <h3 className="signout-modal__title">Sign out</h3>
          <p className="signout-modal__text">Are you sure you want to sign out?</p>
          <div className="signout-modal__actions">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="signout-modal__btn signout-modal__btn--cancel"
            >
              Cancel
            </button>
            <form action={signOutAction} className="signout-modal__form">
              <button type="submit" className="signout-modal__btn signout-modal__btn--confirm">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}
