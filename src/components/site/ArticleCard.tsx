/* Cinescope Global Concept — article card variants; breaking badge = red, featured = lime */
import { Link } from "@tanstack/react-router";

export type SiteArticle = {
  slug: string;
  title: string;
  subtitle: string | null;
  featuredImage: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  categoryColor: string | null;
  author: string | null;
  date: string;
  isBreaking: boolean;
  isFeatured: boolean;
  tags: string[];
  readTimeMinutes: number | null;
};

function nameToSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function Thumbnail({
  src, alt, aspect, color, isBreaking, isFeatured,
}: {
  src: string | null;
  alt: string;
  aspect: string;
  color?: string | null;
  isBreaking?: boolean;
  isFeatured?: boolean;
}) {
  return (
    <div className={`relative w-full ${aspect} bg-surface overflow-hidden mb-4`}>
      {/* Category colour accent strip */}
      {color && (
        <div className="absolute top-0 left-0 right-0 h-[3px] z-10" style={{ backgroundColor: color }} />
      )}
      {/* Image */}
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
        />
      ) : (
        <div className="w-full h-full img-shimmer" />
      )}
      {/* Cinematic overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/0 via-ink/0 to-ink/0 group-hover:from-ink/40 group-hover:via-ink/10 group-hover:to-ink/0 transition-all duration-500" />
      {/* Badges — Breaking = accent-red, Featured = lime */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
        {isBreaking && (
          <span
            className="eyebrow px-2 py-0.5 flex items-center gap-1 text-white"
            style={{ backgroundColor: "var(--accent-red)" }}
          >
            <span className="size-1.5 rounded-full bg-white animate-[pulse-dot_1.6s_ease-in-out_infinite]" />
            Breaking
          </span>
        )}
        {isFeatured && !isBreaking && (
          <span
            className="eyebrow px-2 py-0.5 flex items-center gap-1"
            style={{ backgroundColor: "var(--lime)", color: "var(--lime-foreground)" }}
          >
            ★ Featured
          </span>
        )}
      </div>
    </div>
  );
}

export function ArticleCard({ article, size = "md" }: { article: SiteArticle; size?: "sm" | "md" | "lg" }) {
  const aspect = size === "lg" ? "aspect-[16/10]" : "aspect-[4/3]";
  const titleClass = size === "lg" ? "text-2xl md:text-3xl" : size === "sm" ? "text-base" : "text-xl";

  return (
    <article className="group cursor-pointer card-lift">
      <Link to="/article/$slug" params={{ slug: article.slug }}>
        <Thumbnail
          src={article.featuredImage}
          alt={article.title}
          aspect={aspect}
          color={article.categoryColor}
          isBreaking={article.isBreaking}
          isFeatured={article.isFeatured}
        />

        {/* Category row */}
        <div className="flex items-center gap-2 mb-2.5">
          {article.categoryColor && (
            <span className="inline-block size-[7px] rounded-full shrink-0" style={{ backgroundColor: article.categoryColor }} />
          )}
          <span className="eyebrow" style={{ color: article.categoryColor ?? "var(--accent-red)" }}>
            {article.categoryName ?? "General"}
          </span>
        </div>

        {/* Title */}
        <h3 className={`font-display font-bold leading-[1.12] text-balance group-hover:text-accent-red transition-colors duration-300 ${titleClass}`}>
          {article.title}
        </h3>

        {/* Subtitle */}
        {size !== "sm" && article.subtitle && (
          <p className="mt-2.5 text-sm text-ink-muted font-serif-body leading-relaxed line-clamp-2">
            {article.subtitle}
          </p>
        )}

        {/* Byline */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          <Link
            to="/author/$slug"
            params={{ slug: nameToSlug(article.author || "staff-reporter") }}
            className="text-[11px] font-bold text-ink hover:text-accent-red transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {article.author || "Staff Reporter"}
          </Link>
          <span className="text-rule text-xs">·</span>
          <span className="text-[11px] text-ink-muted">{article.date}</span>
          {article.readTimeMinutes && (
            <>
              <span className="text-rule text-xs">·</span>
              <span className="text-[11px] text-ink-muted">{article.readTimeMinutes} min</span>
            </>
          )}
        </div>
      </Link>
    </article>
  );
}

export function ArticleRow({ article }: { article: SiteArticle }) {
  return (
    <article className="group cursor-pointer flex gap-4">
      <Link to="/article/$slug" params={{ slug: article.slug }} className="shrink-0">
        <div className="relative size-24 md:size-[104px] bg-surface overflow-hidden">
          {article.categoryColor && (
            <div className="absolute top-0 left-0 right-0 h-[3px] z-10" style={{ backgroundColor: article.categoryColor }} />
          )}
          {article.featuredImage ? (
            <img
              src={article.featuredImage}
              alt={article.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full img-shimmer" />
          )}
        </div>
      </Link>
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <Link to="/article/$slug" params={{ slug: article.slug }}>
          <span className="eyebrow block mb-1" style={{ color: article.categoryColor ?? "var(--accent-red)" }}>
            {article.categoryName ?? "General"}
          </span>
          <h4 className="font-display text-[15px] md:text-base font-bold leading-snug mt-0 mb-1.5 group-hover:text-accent-red transition-colors">
            {article.title}
          </h4>
          <p className="text-[11px] text-ink-muted">
            {article.date}
            {article.readTimeMinutes ? ` · ${article.readTimeMinutes} min` : ""}
          </p>
        </Link>
      </div>
    </article>
  );
}

export function NumberedItem({ article, index }: { article: SiteArticle; index: number }) {
  return (
    <Link to="/article/$slug" params={{ slug: article.slug }} className="flex gap-4 group cursor-pointer">
      <span
        className="font-display text-3xl font-black w-9 shrink-0 leading-none pt-0.5 transition-colors"
        style={{ color: article.categoryColor ?? "var(--rule)" }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <p className="font-display text-sm font-bold leading-snug group-hover:text-accent-red transition-colors mb-1 line-clamp-2">
          {article.title}
        </p>
        <p className="eyebrow text-ink-muted">
          {article.categoryName ?? "General"}
          {article.readTimeMinutes ? ` · ${article.readTimeMinutes} min` : ""}
        </p>
      </div>
    </Link>
  );
}
