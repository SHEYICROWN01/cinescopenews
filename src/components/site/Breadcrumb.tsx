import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

type Crumb =
  | { label: string; to: string; params?: Record<string, string>; search?: Record<string, unknown> }
  | { label: string; current: true };

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap">
      <Link to="/" aria-label="Home" className="text-ink-muted hover:text-brand transition-colors shrink-0">
        <Home size={12} />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight size={11} className="text-rule shrink-0" />
          {"current" in crumb ? (
            <span
              className="eyebrow text-ink line-clamp-1 max-w-[200px] md:max-w-[360px]"
              aria-current="page"
            >
              {crumb.label}
            </span>
          ) : (
            <Link
              to={crumb.to as any}
              params={crumb.params as any}
              search={crumb.search as any}
              className="eyebrow text-ink-muted hover:text-brand transition-colors whitespace-nowrap"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
