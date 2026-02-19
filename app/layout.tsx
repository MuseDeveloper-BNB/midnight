import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Midnight News',
    template: '%s | Midnight News',
  },
  description: 'Your source of reliable information. Latest news, analysis and blog posts.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
