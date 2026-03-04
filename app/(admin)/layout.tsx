import Link from 'next/link';
import { AdminNav } from '@/components/admin/AdminNav';
import { SignOutButton } from '@/components/layout/SignOutButton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <header className="admin-layout-header">
        <div className="admin-layout-header-inner">
          <Link href="/admin-dashboard" className="admin-layout-brand">
            Admin
          </Link>
          <AdminNav />
          <nav className="admin-layout-quicklinks" aria-label="Quick links">
            <Link href="/" className="admin-quicklink">View site</Link>
            <SignOutButton className="admin-quicklink admin-quicklink--outline" />
          </nav>
        </div>
      </header>
      <main className="admin-layout-main">{children}</main>
    </div>
  );
}
