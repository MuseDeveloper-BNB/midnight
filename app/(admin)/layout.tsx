import Link from 'next/link';
import { AdminNav } from '@/components/admin/AdminNav';
import { SignOutButton } from '@/components/layout/SignOutButton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <header className="admin-layout-header">
        <div className="admin-layout-header-inner">
          <AdminNav />
          <nav className="admin-layout-quicklinks" aria-label="Quick links">
            <Link href="/" className="admin-nav-link">Home</Link>
            <SignOutButton className="admin-nav-link" />
          </nav>
        </div>
      </header>
      <main className="admin-layout-main">{children}</main>
    </div>
  );
}
