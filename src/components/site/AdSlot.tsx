import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT } from "@/lib/ads";
import { useAds } from "../../routes/__root";
import { trackAdClickFn, trackAdImpressionFn } from "../../fns/ads";

export type AdFormat =
  | "leaderboard"
  | "billboard"
  | "mpu"
  | "half-page"
  | "in-article"
  | "mobile-banner";

const SIZES: Record<AdFormat, { className: string; label: string }> = {
  leaderboard:     { className: "w-full max-w-[970px] h-[90px]",  label: "728 × 90"   },
  billboard:       { className: "w-full max-w-[970px] h-[250px]", label: "970 × 250"  },
  mpu:             { className: "w-[300px] h-[250px] mx-auto",    label: "300 × 250"  },
  "half-page":     { className: "w-[300px] h-[600px] mx-auto",    label: "300 × 600"  },
  "in-article":    { className: "w-full min-h-[280px]",           label: "In-Article" },
  "mobile-banner": { className: "w-[320px] h-[100px] mx-auto",   label: "320 × 100"  },
};

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

function CustomAdBanner({ ad, size, label }: {
  ad: { id: number; title: string; advertiser: string; imageUrl: string; linkUrl: string };
  size: { className: string; label: string };
  label: boolean;
}) {
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackAdImpressionFn({ data: { id: ad.id } }).catch(() => {});
  }, [ad.id]);

  return (
    <aside aria-label="Advertisement" className="my-8 flex flex-col items-center w-full">
      {label && <span className="eyebrow text-ink-muted mb-2 tracking-[0.22em] text-[10px]">Advertisement</span>}
      <a
        href={ad.linkUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block relative group w-full max-w-[970px] mx-auto"
        onClick={() => trackAdClickFn({ data: { id: ad.id } }).catch(() => {})}
        aria-label={`Advertisement: ${ad.title || ad.advertiser}`}
      >
        {ad.imageUrl ? (
          <>
            <img
              src={ad.imageUrl}
              alt={ad.title || ad.advertiser}
              className="w-full h-auto block transition-opacity duration-300 group-hover:opacity-90"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
          </>
        ) : (
          <div className="w-full py-10 bg-surface border border-dashed border-rule flex flex-col items-center justify-center gap-1 text-ink-muted">
            <span className="font-display text-sm font-bold">{ad.advertiser}</span>
            <span className="eyebrow text-xs">{ad.title}</span>
          </div>
        )}
      </a>
    </aside>
  );
}

export function AdSlot({
  format = "mpu",
  slot,
  position,
  client,
  label = true,
  className = "",
}: {
  format?: AdFormat;
  slot?: string;
  position?: string;
  client?: string;
  label?: boolean;
  className?: string;
}) {
  const ads = useAds();
  const adsenseRef = useRef<HTMLModElement>(null);
  const resolvedClient = client || ADSENSE_CLIENT;
  const size = SIZES[format];

  // Resolve the custom ad: exact position key match wins, then format-based fallback
  const customAd = ads.find((a) => position ? a.position === position : a.position === format);

  const live = Boolean(!customAd && slot && resolvedClient);

  useEffect(() => {
    if (!live) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { /* dev */ }
  }, [live]);

  if (customAd) {
    return <CustomAdBanner ad={customAd} size={size} label={label} />;
  }

  return (
    <aside aria-label="Advertisement" className={`my-8 flex flex-col items-center ${className}`}>
      {label && <span className="eyebrow text-ink-muted mb-2 tracking-[0.22em]">Advertisement</span>}
      {live ? (
        <ins
          ref={adsenseRef as any}
          className={`adsbygoogle block ${size.className}`}
          style={{ display: "block" }}
          data-ad-client={resolvedClient}
          data-ad-slot={slot}
          data-ad-format={format === "in-article" ? "fluid" : "auto"}
          data-ad-layout={format === "in-article" ? "in-article" : undefined}
          data-full-width-responsive="true"
        />
      ) : (
        <div className={`bg-surface border border-dashed border-rule grid place-items-center text-ink-muted ${size.className}`}>
          <div className="text-center px-4">
            <p className="font-display text-sm font-bold tracking-tight">Ad Space · {size.label}</p>
            <p className="eyebrow text-ink-muted mt-1.5 opacity-70">{format.replace("-", " ")}</p>
          </div>
        </div>
      )}
    </aside>
  );
}
