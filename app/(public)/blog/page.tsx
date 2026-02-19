import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { contentService } from '@/services/content/content.service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog – Midnight News',
  description: 'Analysis, columns and opinion from our authors.',
};

function extractFirstImage(body: string): string | null {
  const match = body.match(/<img[^>]+src=["']([^"']+)["']/);
  return match ? match[1] : null;
}

function getContentImage(item: { imageUrl?: string | null; body: string }): string | null {
  return item.imageUrl ?? extractFirstImage(item.body) ?? null;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: { limit?: string; offset?: string };
}) {
  const limit = Number(searchParams?.limit ?? 20);
  const offset = Number(searchParams?.offset ?? 0);
  const content = await contentService.getPublishedContent({ type: 'BLOG', limit, offset });

  return (
    <section>
      <header className="list-header">
        <h1>Blog</h1>
      </header>

      {content.length === 0 ? (
        <div className="empty-state">
          <p>No published blog posts at the moment.</p>
        </div>
      ) : (
        <div className="list-grid">
          {content.map((item) => {
            const image = getContentImage(item);
            return (
              <article key={item.id} className="news-card">
                {image && (
                  <Link href={`/blog/${item.slug}`} className="card-image">
                    <Image src={image} alt="" width={400} height={225} sizes="(max-width: 768px) 100vw, 400px" unoptimized />
                  </Link>
                )}
                <h2 className="card-title">
                  <Link href={`/blog/${item.slug}`}>{item.title}</Link>
                </h2>
                <div className="card-meta">
                  {item.author?.name ?? 'Editorial'}
                  {item.publishedAt && <span> · {formatDate(item.publishedAt.toISOString())}</span>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
