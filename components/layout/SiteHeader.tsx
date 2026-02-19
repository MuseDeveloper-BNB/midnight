import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/auth';
import { SignOutButton } from '@/components/layout/SignOutButton';

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function SiteHeader() {
  const session = await auth();

  return (
    <header className="site-header">
      <div className="header-top">
        <span className="header-date">{formatDate()}</span>
        {session && (
          <div className="header-auth">
            {(() => {
              const role = (session.user as { role?: string })?.role;
              return role === 'ADMIN' || role === 'EDITOR';
            })() && (
              <>
                <Link href="/admin-dashboard">Dashboard</Link>
                <span>·</span>
              </>
            )}
            <SignOutButton />
          </div>
        )}
      </div>

      <div className="masthead">
        <Link href="/" className="masthead-banner-link">
          <Image
            src="/banner02.png"
            alt="Midnight News"
            width={1280}
            height={320}
            className="masthead-banner"
            priority
          />
        </Link>
      </div>

      <nav className="main-nav">
        <Link href="/">Home</Link>
        <Link href="/news">News</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/night">$NIGHT</Link>
        <Link href="/butter-index">Butter Index</Link>
      </nav>
    </header>
  );
}
