import { useEffect, useRef } from "react";

/**
 * Google AdSense / Ad Manager slot.
 *
 * SETUP (one time):
 *   1. Get your AdSense publisher ID (ca-pub-XXXXXXXXXXXXXXXX)
 *   2. Set it in src/routes/__root.tsx where the AdSense script tag is configured
 *   3. Create ad units in your AdSense dashboard, copy the data-ad-slot IDs
 *   4. Pass each slot ID as the `slot` prop below
 *
 * Until a publisher ID is wired in, a tasteful placeholder renders in its place.
 */

type AdFormat =
  | "leaderboard"      // 728x90 / responsive top banner
  | "billboard"        // 970x250 large brand canvas
  | "mpu"              // 300x250 medium rectangle (sidebar / in-feed)
  | "half-page"        // 300x600 sidebar
  | "in-article"       // responsive fluid in article body
  | "mobile-banner";   // 320x100 sticky mobile

const SIZES: Record<AdFormat, { className: string; label: string }> = {
  leaderboard:   { className: "w-full max-w-[970px] h-[90px] md:h-[90px]", label: "728 × 90" },
  billboard:     { className: "w-full max-w-[970px] h-[250px]", label: "970 × 250" },
  mpu:           { className: "w-[300px] h-[250px] mx-auto", label: "300 × 250" },
  "half-page":   { className: "w-[300px] h-[600px] mx-auto", label: "300 × 600" },
  "in-article":  { className: "w-full min-h-[280px]", label: "In-Article" },
  "mobile-banner": { className: "w-[320px] h-[100px] mx-auto", label: "320 × 100" },
};

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

export function AdSlot({
  format = "mpu",
  slot,
  client,
  label = true,
  className = "",
}: {
  format?: AdFormat;
  slot?: string;            // data-ad-slot
  client?: string;          // data-ad-client (ca-pub-XXXX)
  label?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLModElement>(null);
  const live = Boolean(slot && client);
  const size = SIZES[format];

  useEffect(() => {
    if (!live) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // adsbygoogle not loaded yet — harmless during dev
    }
  }, [live]);

  return (
    <aside
      aria-label="Advertisement"
      className={`my-8 flex flex-col items-center ${className}`}
    >
      {label && (
        <span className="eyebrow text-ink-muted mb-2 tracking-[0.22em]">
          Advertisement
        </span>
      )}
      {live ? (
        <ins
          ref={ref as any}
          className={`adsbygoogle block ${size.className}`}
          style={{ display: "block" }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={format === "in-article" ? "fluid" : "auto"}
          data-ad-layout={format === "in-article" ? "in-article" : undefined}
          data-full-width-responsive="true"
        />
      ) : (
        <div
          className={`bg-surface border border-dashed border-rule grid place-items-center text-ink-muted ${size.className}`}
        >
          <div className="text-center px-4">
            <p className="font-display text-sm font-bold tracking-tight">
              Google Ads · {size.label}
            </p>
            <p className="eyebrow text-ink-muted mt-1.5 opacity-70">
              {format.replace("-", " ")}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
