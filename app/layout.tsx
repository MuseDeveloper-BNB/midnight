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
      <head>
        {/* Google tag (GTM-K2JT3HWP) */}
        <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-K2JT3HWP"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
