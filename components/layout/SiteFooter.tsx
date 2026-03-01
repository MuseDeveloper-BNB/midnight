import Link from 'next/link';
import Image from 'next/image';

function XLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-links">
          <Link href="/news">News</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/night">$NIGHT</Link>
          <Link href="/butter-index">Butter Index</Link>
        </div>
        <div className="footer-brand-wrap">
          <a
            href="https://x.com/MidnightNewsio"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-x-link"
            aria-label="Follow us on X"
          >
            <XLogo className="footer-x-logo" />
            <span className="footer-x-handle">@MidnightNewsio</span>
          </a>
          <Image
            src="/logo_transparent.png"
            alt="Midnight News Logo"
            width={48}
            height={48}
            className="footer-logo"
          />
        </div>
        <div className="footer-powered">
          <a href="https://midnight.network" target="_blank" rel="noopener noreferrer" className="footer-midnight-link">
            <Image
              src="/midnight-logo-horizontal.svg"
              alt="Midnight Network"
              width={160}
              height={35}
              className="footer-midnight-logo"
            />
          </a>
        </div>
        <p className="footer-disclaimer">
          This is an independent news source and is not associated with Midnight Network.
        </p>
        <p className="footer-copyright">
          © {new Date().getFullYear()} Midnight News. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
