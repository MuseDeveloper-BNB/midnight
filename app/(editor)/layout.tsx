import Link from 'next/link';

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav>
        <Link href="/editor-dashboard">Dashboard</Link> |{' '}
        <Link href="/editor/content/new">New content</Link>
      </nav>
      <main>{children}</main>
    </div>
  );
}
