'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconUser, IconComments, IconBookmark } from '@/components/profile/ProfileIcons';

export function ProfileNav() {
  const pathname = usePathname();

  const links = [
    { href: '/profile', label: 'Profile', icon: IconUser },
    { href: '/profile/comments', label: 'My comments', icon: IconComments },
    { href: '/profile/saved', label: 'Saved', icon: IconBookmark },
  ];

  return (
    <nav className="profile-nav" aria-label="Profile navigation">
      {links.map(({ href, label, icon: Icon }) => {
        const isActive = href === '/profile' ? pathname === '/profile' : pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`profile-nav__link ${isActive ? 'profile-nav__link--active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
