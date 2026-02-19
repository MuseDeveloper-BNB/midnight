'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/admin-dashboard', label: 'Dashboard' },
  { href: '/users', label: 'Users' },
  { href: '/moderation-history', label: 'Moderation history' },
  { href: '/admin-news', label: 'News' },
  { href: '/admin-blogs', label: 'Blogs' },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav" aria-label="Admin section">
      <ul className="admin-nav-list">
        {items.map(({ href, label }) => {
          const isActive =
            href === '/admin-dashboard'
              ? pathname === '/admin-dashboard'
              : pathname?.startsWith(href);
          return (
            <li key={href} className="admin-nav-item">
              <Link
                href={href}
                className={isActive ? 'admin-nav-link is-active' : 'admin-nav-link'}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
