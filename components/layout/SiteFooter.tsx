import Link from 'next/link';
import Image from 'next/image';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand-wrap">
          <Image
            src="/logo_transparent.png"
            alt="Midnight News Logo"
            width={48}
            height={48}
            className="footer-logo"
          />
          <div className="footer-brand">Midnight News</div>
        </div>
        <div className="footer-links">
          <Link href="/news">News</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/night">$NIGHT</Link>
          <Link href="/butter-index">Butter Index</Link>
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
