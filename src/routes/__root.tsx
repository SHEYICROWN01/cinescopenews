/* Cinescope Global Concept — root layout, meta, fonts, global shell */
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Header } from "@/components/site/Header";
import { BreakingTicker } from "@/components/site/BreakingTicker";
import { MarketTicker } from "@/components/site/MarketTicker";
import { Footer } from "@/components/site/Footer";
import { AdSlot } from "@/components/site/AdSlot";
import { BackToTop } from "@/components/site/BackToTop";
import { CookieBanner } from "@/components/site/CookieBanner";
import { ADSENSE_CLIENT, AD_SLOTS } from "@/lib/ads";
import { getPublicCategories } from "../fns/categories";
import { getBreakingTitles } from "../fns/articles";
import { trackPageViewFn } from "../fns/analytics";
import { getActiveAdsFn } from "../fns/ads";
import { createContext, useContext } from "react";

export type ActiveAd = { id: number; title: string; advertiser: string; imageUrl: string; linkUrl: string; position: string };
export const AdsContext = createContext<ActiveAd[]>([]);
export function useAds() { return useContext(AdsContext); }

function getOrCreateSessionId(): string {
  try {
    let id = localStorage.getItem("_csg_sid");
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("_csg_sid", id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async () => {
    try {
      const [categories, breakingTitles, activeAds] = await Promise.all([
        getPublicCategories(),
        getBreakingTitles(),
        getActiveAdsFn().catch(() => [] as ActiveAd[]),
      ]);
      return { categories, breakingTitles, activeAds };
    } catch {
      return { categories: [] as Awaited<ReturnType<typeof getPublicCategories>>, breakingTitles: [] as string[], activeAds: [] as ActiveAd[] };
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Cinescope Global Concept — Bold. Global. Investigative." },
      { name: "description", content: "Cinescope Global Concept delivers bold investigative journalism and in-depth analysis on politics, business, technology, sports and world affairs." },
      { property: "og:title", content: "Cinescope Global Concept — Bold. Global. Investigative." },
      { property: "og:description", content: "Bold investigative journalism and in-depth analysis on politics, business, technology, sports and world affairs from Cinescope Global Concept." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Cinescope Global Concept" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@CinescopeGlobal" },
      { name: "twitter:title", content: "Cinescope Global Concept — Bold. Global. Investigative." },
      { name: "twitter:description", content: "Bold investigative journalism and in-depth analysis from Cinescope Global Concept." },
    ],
    scripts: [
      ...(ADSENSE_CLIENT
        ? [
            {
              src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`,
              async: true,
              crossOrigin: "anonymous",
            },
          ]
        : []),
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://www.cinescopeglobal.com/#organization",
              name: "Cinescope Global Concept",
              url: "https://www.cinescopeglobal.com",
              logo: {
                "@type": "ImageObject",
                url: "https://www.cinescopeglobal.com/logo.png",
                width: 200,
                height: 60,
              },
              sameAs: [
                "https://twitter.com/CinescopeGlobal",
                "https://facebook.com/CinescopeGlobal",
              ],
            },
            {
              "@type": "WebSite",
              "@id": "https://www.cinescopeglobal.com/#website",
              url: "https://www.cinescopeglobal.com",
              name: "Cinescope Global Concept",
              description: "Bold investigative journalism and global news coverage.",
              publisher: { "@id": "https://www.cinescopeglobal.com/#organization" },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://www.cinescopeglobal.com/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
              inLanguage: "en-NG",
            },
          ],
        }),
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/logo.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/logo.png" },
      {
        rel: "alternate",
        type: "application/rss+xml",
        title: "Cinescope Global Concept RSS Feed",
        href: "https://www.cinescopeglobal.com/feed.xml",
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,600&family=Instrument+Serif:ital@0;1&family=Source+Serif+4:opsz,wght@8..60,400&family=JetBrains+Mono:wght@500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Must be first in <head> — runs before any paint to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `
(function(){
  try {
    var saved = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e){}
})();
        `}} />
        {GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','${GA_ID}',{page_path:window.location.pathname});
            `}} />
          </>
        )}
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { categories, breakingTitles, activeAds } = Route.useLoaderData();
  const router = useRouter();

  const isManagementPortal = router.state.location.pathname.startsWith('/management-portal');

  // Track every public page view
  useEffect(() => {
    const path = router.state.location.pathname;
    if (path.startsWith("/management-portal")) return;
    const sessionId = getOrCreateSessionId();
    trackPageViewFn({
      data: {
        path,
        referrer: document.referrer,
        ua: navigator.userAgent,
        sessionId,
      },
    }).catch(() => {});
  }, [router.state.location.pathname]);

  if (isManagementPortal) {
    return (
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
    <AdsContext.Provider value={activeAds}>
      <div className="min-h-screen flex flex-col bg-background text-ink">
        <MarketTicker />
        <Header categories={categories} />
        {/* Breaking ticker sits below the navbar as a distinct sticky editorial strip */}
        <BreakingTicker titles={breakingTitles} />
        <main className="flex-1">
          <Outlet />
        </main>
        <div className="border-t border-rule bg-surface/40">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-4">
            <AdSlot format="leaderboard" slot={AD_SLOTS.FOOTER_LEADERBOARD} position="footer-leaderboard" label />
          </div>
        </div>
        <Footer categories={categories} />
        <BackToTop />
        <CookieBanner />
      </div>
    </AdsContext.Provider>
    </QueryClientProvider>
  );
}
