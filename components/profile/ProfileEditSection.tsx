'use client';

import { useState } from 'react';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { IconEdit } from '@/components/profile/ProfileIcons';

type ProfileEditSectionProps = {
  name: string | null;
  email: string;
};

export default function ProfileEditSection({ name, email }: ProfileEditSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <section className="profile-header" aria-labelledby="profile-heading">
      <div className="profile-header__row">
        <div className="profile-header__info">
          <h1 id="profile-heading" className="profile-header__name">
            {name || 'Member'}
          </h1>
          <p className="profile-header__email">{email}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing((v) => !v)}
          className="profile-edit-toggle"
          aria-expanded={isEditing}
          aria-label={isEditing ? 'Close form' : 'Edit profile'}
        >
          <IconEdit size={18} />
          <span>{isEditing ? 'Cancel' : 'Edit'}</span>
        </button>
      </div>
      {isEditing && (
        <div className="profile-header__form">
          <ProfileForm
            initialName={name}
            initialEmail={email}
            onSuccess={() => setIsEditing(false)}
          />
        </div>
      )}
    </section>
  );
}
