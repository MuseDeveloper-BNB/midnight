import Image from 'next/image';
import { sanitizeHtml } from '@/utils/sanitization';

type ArticleDetailProps = {
  title: string;
  body: string;
  category?: string;
  authorName?: string | null;
  publishedAt?: string | null;
  imageUrl?: string | null;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Remove the first figure/img from body if we already have a cover image
 * to avoid showing the same image twice.
 */
function removeFirstImage(html: string): string {
  // Remove first <figure>...</figure> block
  const figureRemoved = html.replace(/<figure[^>]*>[\s\S]*?<\/figure>/i, '');
  if (figureRemoved !== html) return figureRemoved.trim();
  
  // If no figure, remove first standalone <img> tag
  return html.replace(/<img[^>]*>/i, '').trim();
}

export function ArticleDetail({ title, body, category = 'News', authorName, publishedAt, imageUrl }: ArticleDetailProps) {
  // If there's a cover image, remove the first image from body to avoid duplication
  const processedBody = imageUrl ? removeFirstImage(body) : body;
  const safeBody = sanitizeHtml(processedBody);

  return (
    <article>
      {imageUrl && (
        <div className="article-cover">
          <Image
            src={imageUrl}
            alt=""
            className="article-cover-img"
            width={800}
            height={450}
            sizes="(max-width: 768px) 100vw, 800px"
            unoptimized
          />
        </div>
      )}

      {/* Article Header */}
      <header className="article-header">
        <span className="article-category">{category}</span>
        <h1 className="article-title">{title}</h1>
        <div className="article-byline">
          <span className="author">{authorName ?? 'Editorial'}</span>
          {publishedAt && (
            <>
              <span className="divider">|</span>
              <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
            </>
          )}
        </div>
      </header>

      {/* Article Body */}
      <div className="article-body">
        <div
          className="article-body-content"
          dangerouslySetInnerHTML={{ __html: safeBody }}
        />
      </div>
    </article>
  );
}
