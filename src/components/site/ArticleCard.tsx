import { Link } from "@tanstack/react-router";
import type { Article } from "@/lib/news-data";

export function ArticleCard({
  article,
  size = "md",
}: {
  article: Article;
  size?: "sm" | "md" | "lg";
}) {
  const aspect = size === "lg" ? "aspect-[16/10]" : "aspect-[4/3]";
  const titleClass =
    size === "lg"
      ? "text-2xl md:text-3xl"
      : size === "sm"
      ? "text-base"
      : "text-xl";

  return (
    <article className="group cursor-pointer">
      <Link to="/article/$slug" params={{ slug: article.slug }}>
        <div className={`relative w-full ${aspect} bg-surface overflow-hidden mb-4`}>
          <img
            src={article.image}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-brand eyebrow">{article.category}</span>
          <span className="eyebrow text-ink-muted">{article.readTime}</span>
        </div>
        <h3
          className={`font-display font-bold leading-[1.15] text-balance group-hover:text-brand transition-colors ${titleClass}`}
        >
          {article.title}
        </h3>
        {size !== "sm" && (
          <p className="mt-3 text-sm text-ink-muted font-serif-body leading-relaxed line-clamp-2">
            {article.excerpt}
          </p>
        )}
        <p className="mt-3 text-xs text-ink-muted">
          By <span className="font-semibold text-ink">{article.author}</span> · {article.date}
        </p>
      </Link>
    </article>
  );
}

export function ArticleRow({ article }: { article: Article }) {
  return (
    <article className="group cursor-pointer flex gap-5">
      <Link
        to="/article/$slug"
        params={{ slug: article.slug }}
        className="shrink-0"
      >
        <div className="size-24 md:size-28 bg-surface overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </Link>
      <div className="min-w-0">
        <Link to="/article/$slug" params={{ slug: article.slug }}>
          <span className="text-brand eyebrow">{article.category}</span>
          <h4 className="font-display text-base md:text-lg font-bold leading-snug mt-1 mb-2 group-hover:text-brand transition-colors">
            {article.title}
          </h4>
          <p className="text-xs text-ink-muted">
            {article.date} · {article.readTime}
          </p>
        </Link>
      </div>
    </article>
  );
}

export function NumberedItem({
  article,
  index,
}: {
  article: Article;
  index: number;
}) {
  return (
    <Link
      to="/article/$slug"
      params={{ slug: article.slug }}
      className="flex gap-5 group cursor-pointer"
    >
      <span className="font-display text-4xl font-light text-rule group-hover:text-brand transition-colors w-10 shrink-0">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div>
        <p className="font-bold text-sm leading-snug group-hover:underline underline-offset-2 mb-1">
          {article.title}
        </p>
        <span className="eyebrow text-ink-muted">{article.category}</span>
      </div>
    </Link>
  );
}
