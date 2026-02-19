import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { contentService } from '@/services/content/content.service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Midnight News – Your source of reliable information',
  description: 'Latest news, analysis and blog posts. Read Midnight News for trustworthy, timely coverage.',
};

function extractExcerpt(body: string, maxLength: number = 180): string {
  const plainText = body.replace(/<[^>]*>/g, '').trim();
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength).trim() + '...';
}

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

export default async function HomePage() {
  const news = await contentService.getPublishedContent({ type: 'NEWS', limit: 7 });
  const blog = await contentService.getPublishedContent({ type: 'BLOG', limit: 3 });
  const lead = news[0] ?? null;
  const secondary = news.slice(1, 4);
  const moreNews = news.slice(4);

  if (!lead) {
    return (
      <>
        <div className="empty-state">
          <p>No published news at the moment.</p>
          <p>Follow us for the latest updates.</p>
        </div>
        <section className="home-about">
          <h2>About Midnight News</h2>
          <p>
            Midnight News is a news and blog platform. We publish timely news articles, in-depth analysis, and opinion pieces. Our goal is to provide readers with reliable, well-sourced information in one place.
          </p>
          <p>
            Browse <Link href="/news">News</Link> for the latest stories and <Link href="/blog">Blog</Link> for analysis and commentary.
          </p>
        </section>
      </>
    );
  }

  const leadImage = getContentImage(lead);

  return (
    <>
      {/* Featured news */}
      <section className="home-featured" aria-label="Featured stories">
        <article className="lead-story">
          {leadImage && (
            <Link href={`/news/${lead.slug}`} className="story-image">
              <Image src={leadImage} alt="" width={640} height={360} sizes="(max-width: 768px) 100vw, 640px" unoptimized />
            </Link>
          )}
          <span className="story-category">Latest</span>
          <h2 className="story-title">
            <Link href={`/news/${lead.slug}`}>{lead.title}</Link>
          </h2>
          <p className="story-excerpt">{extractExcerpt(lead.body, 220)}</p>
          <div className="story-meta">
            <span className="author">{lead.author?.name ?? 'Editorial'}</span>
            {lead.publishedAt && <span> · {formatDate(lead.publishedAt.toISOString())}</span>}
          </div>
        </article>

        <div className="secondary-stories">
          {secondary.map((item) => (
            <article key={item.id} className="secondary-story">
              <h3 className="story-title">
                <Link href={`/news/${item.slug}`}>{item.title}</Link>
              </h3>
              <div className="story-meta">
                {item.author?.name ?? 'Editorial'}
                {item.publishedAt && <span> · {formatDate(item.publishedAt.toISOString())}</span>}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* More news grid */}
      {moreNews.length > 0 && (
        <section className="news-grid" aria-label="More news">
          <h2 className="news-grid-title">More news</h2>
          {moreNews.map((item) => {
            const image = getContentImage(item);
            return (
              <article key={item.id} className="news-card">
                {image && (
                  <Link href={`/news/${item.slug}`} className="card-image">
                    <Image src={image} alt="" width={400} height={225} sizes="(max-width: 768px) 100vw, 400px" unoptimized />
                  </Link>
                )}
                <h3 className="card-title">
                  <Link href={`/news/${item.slug}`}>{item.title}</Link>
                </h3>
                <div className="card-meta">
                  {item.author?.name ?? 'Editorial'}
                  {item.publishedAt && <span> · {formatDate(item.publishedAt.toISOString())}</span>}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Latest from blog */}
      {blog.length > 0 && (
        <section className="news-grid" aria-label="Latest from blog" style={{ marginTop: 'var(--space-xl)' }}>
          <h2 className="news-grid-title">Latest from blog</h2>
          {blog.map((item) => {
            const image = getContentImage(item);
            return (
              <article key={item.id} className="news-card">
                {image && (
                  <Link href={`/blog/${item.slug}`} className="card-image">
                    <Image src={image} alt="" width={400} height={225} sizes="(max-width: 768px) 100vw, 400px" unoptimized />
                  </Link>
                )}
                <h3 className="card-title">
                  <Link href={`/blog/${item.slug}`}>{item.title}</Link>
                </h3>
                <div className="card-meta">
                  {item.author?.name ?? 'Editorial'}
                  {item.publishedAt && <span> · {formatDate(item.publishedAt.toISOString())}</span>}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Site description */}
      <section className="home-about">
        <h2>About Midnight News</h2>
        <p>
          Midnight News is a news and blog platform. We publish timely news articles, in-depth analysis, and opinion pieces. Our goal is to provide readers with reliable, well-sourced information in one place.
        </p>
        <p>
          Browse <Link href="/news">News</Link> for the latest stories and <Link href="/blog">Blog</Link> for analysis and commentary.
        </p>
      </section>
    </>
  );
}
