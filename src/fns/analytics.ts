import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/start-server-core";
import { desc, count, sql, eq, inArray } from "drizzle-orm";
import { db, withRetry } from "../db";
import { pageViews, articles, categories } from "../db/schema";

// ─── UA Parsers ───────────────────────────────────────────────────────────────

function parseDevice(ua: string): string {
  if (/iPhone|Android.*Mobile|BlackBerry|IEMobile|Windows Phone/i.test(ua)) return "Mobile";
  if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) return "Tablet";
  return "Desktop";
}

function parseBrowser(ua: string): string {
  if (/Edg\//i.test(ua))          return "Edge";
  if (/OPR|Opera/i.test(ua))      return "Opera";
  if (/SamsungBrowser/i.test(ua)) return "Samsung";
  if (/Chrome/i.test(ua))         return "Chrome";
  if (/Firefox/i.test(ua))        return "Firefox";
  if (/Safari/i.test(ua))         return "Safari";
  return "Other";
}

function parseSource(referrer: string): string {
  if (!referrer) return "Direct";
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (host.includes("cinescopeglobal.com")) return "Direct";
    if (host.includes("google."))       return "Google";
    if (host.includes("bing.com"))      return "Bing";
    if (host.includes("yahoo.com"))     return "Yahoo";
    if (host.includes("duckduckgo"))    return "DuckDuckGo";
    if (host.includes("facebook.com") || host.includes("fb.com")) return "Facebook";
    if (host.includes("twitter.com") || host.includes("x.com") || host === "t.co") return "Twitter / X";
    if (host.includes("instagram.com")) return "Instagram";
    if (host.includes("tiktok.com"))    return "TikTok";
    if (host.includes("whatsapp.com"))  return "WhatsApp";
    if (host.includes("youtube.com"))   return "YouTube";
    if (host.includes("linkedin.com"))  return "LinkedIn";
    if (host.includes("reddit.com"))    return "Reddit";
    if (host.includes("telegram.org") || host.includes("t.me")) return "Telegram";
    if (host.includes("snapchat.com"))  return "Snapchat";
    if (host.includes("threads.net"))   return "Threads";
    return host.replace(/^www\./, "");
  } catch {
    return "Referral";
  }
}

// ─── Country data ─────────────────────────────────────────────────────────────

export const COUNTRY_NAMES: Record<string, string> = {
  NG:"Nigeria",US:"United States",GB:"United Kingdom",GH:"Ghana",
  ZA:"South Africa",KE:"Kenya",CA:"Canada",AU:"Australia",
  DE:"Germany",FR:"France",IN:"India",BR:"Brazil",IT:"Italy",
  ES:"Spain",NL:"Netherlands",PL:"Poland",SE:"Sweden",
  NO:"Norway",DK:"Denmark",FI:"Finland",CH:"Switzerland",
  BE:"Belgium",AT:"Austria",PT:"Portugal",GR:"Greece",
  RU:"Russia",CN:"China",JP:"Japan",KR:"South Korea",
  SG:"Singapore",MY:"Malaysia",TZ:"Tanzania",UG:"Uganda",
  RW:"Rwanda",ET:"Ethiopia",EG:"Egypt",MA:"Morocco",
  TN:"Tunisia",CM:"Cameroon",SN:"Senegal",CI:"Côte d'Ivoire",
  AO:"Angola",ZM:"Zambia",ZW:"Zimbabwe",MX:"Mexico",
  AR:"Argentina",CO:"Colombia",CL:"Chile",AE:"UAE",
  SA:"Saudi Arabia",QA:"Qatar",KW:"Kuwait",TR:"Turkey",
  PK:"Pakistan",BD:"Bangladesh",ID:"Indonesia",PH:"Philippines",
  TH:"Thailand",VN:"Vietnam",UA:"Ukraine",IR:"Iran",IQ:"Iraq",
  IL:"Israel",JO:"Jordan",LB:"Lebanon",LY:"Libya",SD:"Sudan",
  SO:"Somalia",TG:"Togo",BJ:"Benin",NE:"Niger",ML:"Mali",
  BF:"Burkina Faso",MZ:"Mozambique",MG:"Madagascar",NA:"Namibia",
  BW:"Botswana",MU:"Mauritius",NZ:"New Zealand",HU:"Hungary",
  RO:"Romania",CZ:"Czech Republic",SK:"Slovakia",SI:"Slovenia",
  HR:"Croatia",RS:"Serbia",BG:"Bulgaria",LT:"Lithuania",
  LV:"Latvia",EE:"Estonia",IE:"Ireland",IS:"Iceland",LU:"Luxembourg",
  MT:"Malta",CY:"Cyprus",AL:"Albania",
};

// Alpha-2 → ISO 3166-1 numeric (for world map choropleth)
export const ALPHA2_TO_NUMERIC: Record<string, string> = {
  AF:"4",AL:"8",DZ:"12",AO:"24",AR:"32",AU:"36",AT:"40",AZ:"31",
  BD:"50",BE:"56",BF:"854",BG:"100",BJ:"204",BN:"96",BO:"68",
  BR:"76",BW:"72",BY:"112",CA:"124",CI:"384",CL:"152",CM:"120",
  CN:"156",CO:"170",CR:"188",CY:"196",CZ:"203",DE:"276",DK:"208",
  EE:"233",EG:"818",ES:"724",ET:"231",FI:"246",FJ:"242",FR:"250",
  GB:"826",GH:"288",GR:"300",HN:"340",HR:"191",HU:"348",ID:"360",
  IE:"372",IL:"376",IN:"356",IQ:"368",IR:"364",IS:"352",IT:"380",
  JO:"400",JP:"392",KE:"404",KR:"410",KW:"414",LB:"422",LT:"440",
  LU:"442",LV:"428",LY:"434",MA:"504",MG:"450",ML:"466",MT:"470",
  MU:"480",MX:"484",MY:"458",MZ:"508",NA:"516",NE:"562",NG:"566",
  NL:"528",NO:"578",NZ:"554",PH:"608",PK:"586",PL:"616",PT:"620",
  QA:"634",RO:"642",RS:"688",RU:"643",RW:"646",SA:"682",SC:"690",
  SD:"729",SE:"752",SG:"702",SI:"705",SK:"703",SN:"686",SO:"706",
  SZ:"748",TG:"768",TH:"764",TN:"788",TR:"792",TZ:"834",UA:"804",
  UG:"800",US:"840",VN:"704",ZA:"710",ZM:"894",ZW:"716",
  MK:"807",BA:"70",MD:"498",AM:"51",GE:"268",
};

export function countryName(code: string): string {
  return COUNTRY_NAMES[code?.toUpperCase()] ?? code ?? "Unknown";
}

// ─── Track page view ──────────────────────────────────────────────────────────

export const trackPageViewFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as {
    path: string; referrer: string; ua: string; sessionId: string;
  })
  .handler(async ({ data }) => {
    let country = "";
    try {
      const cfCountry = getRequestHeader("cf-ipcountry" as any);
      if (cfCountry && cfCountry !== "XX" && cfCountry !== "T1") {
        country = cfCountry.toUpperCase().slice(0, 2);
      }
    } catch {}

    await withRetry(() =>
      db.insert(pageViews).values({
        path:      data.path.slice(0, 500),
        source:    parseSource(data.referrer),
        country,
        device:    parseDevice(data.ua),
        browser:   parseBrowser(data.ua),
        sessionId: data.sessionId.slice(0, 64),
      })
    );

    return { ok: true };
  });

// ─── Period helpers ───────────────────────────────────────────────────────────

function periodFilter(period: string) {
  if (period === "today") return sql`date(${pageViews.createdAt}) = date('now')`;
  if (period === "7d")    return sql`${pageViews.createdAt} >= datetime('now', '-7 days')`;
  if (period === "30d")   return sql`${pageViews.createdAt} >= datetime('now', '-30 days')`;
  return sql`1 = 1`;
}

function periodStartExpr(period: string): string {
  if (period === "today") return "date('now')";
  if (period === "7d")    return "datetime('now', '-7 days')";
  if (period === "30d")   return "datetime('now', '-30 days')";
  return "datetime('1970-01-01')";
}

// ─── Main analytics query ─────────────────────────────────────────────────────

export const getAnalyticsData = createServerFn({ method: "GET" })
  .inputValidator((p: unknown) => (p ?? "7d") as string)
  .handler(async ({ data: period }) => {
    const where    = periodFilter(period);
    const chartDays = period === "today" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 60;

    const [
      totalViewsRes,
      uniqueVisitorsRes,
      topPagesRes,
      sourcesRes,
      countriesRes,
      devicesRes,
      browsersRes,
      dailyRes,
      realtimeRes,
      hourlyRes,
      categoryRes,
      trendingRes,
    ] = await withRetry(() =>
      Promise.all([
        // 1. Total page views
        db.select({ n: count() }).from(pageViews).where(where),

        // 2. Unique visitors (distinct sessions)
        db.select({ n: sql<number>`count(distinct ${pageViews.sessionId})` })
          .from(pageViews).where(where),

        // 3. Top pages
        db.select({ path: pageViews.path, n: count() })
          .from(pageViews).where(where)
          .groupBy(pageViews.path)
          .orderBy(desc(count()))
          .limit(10),

        // 4. Traffic sources
        db.select({ label: pageViews.source, n: count() })
          .from(pageViews).where(where)
          .groupBy(pageViews.source)
          .orderBy(desc(count()))
          .limit(10),

        // 5. Countries (with alpha-2 code for map)
        db.select({ code: pageViews.country, n: count() })
          .from(pageViews)
          .where(sql`(${where}) AND ${pageViews.country} != ''`)
          .groupBy(pageViews.country)
          .orderBy(desc(count()))
          .limit(30),

        // 6. Devices
        db.select({ label: pageViews.device, n: count() })
          .from(pageViews).where(where)
          .groupBy(pageViews.device)
          .orderBy(desc(count())),

        // 7. Browsers
        db.select({ label: pageViews.browser, n: count() })
          .from(pageViews).where(where)
          .groupBy(pageViews.browser)
          .orderBy(desc(count()))
          .limit(6),

        // 8. Daily views for chart
        db.select({
          date:     sql<string>`date(${pageViews.createdAt})`.as("date"),
          views:    count(),
          visitors: sql<number>`count(distinct ${pageViews.sessionId})`.as("visitors"),
        })
          .from(pageViews)
          .where(sql`${pageViews.createdAt} >= datetime('now', '-${sql.raw(String(chartDays))} days')`)
          .groupBy(sql`date(${pageViews.createdAt})`)
          .orderBy(sql`date(${pageViews.createdAt})`),

        // 9. Real-time (last 30 min)
        db.select({ n: count() })
          .from(pageViews)
          .where(sql`${pageViews.createdAt} >= datetime('now', '-30 minutes')`),

        // 10. Hourly traffic pattern (all 24 hours)
        db.select({
          hour: sql<number>`CAST(strftime('%H', ${pageViews.createdAt}) AS INTEGER)`.as("hour"),
          n:    count(),
        })
          .from(pageViews).where(where)
          .groupBy(sql`strftime('%H', ${pageViews.createdAt})`)
          .orderBy(sql`CAST(strftime('%H', ${pageViews.createdAt}) AS INTEGER)`),

        // 11. Category performance (join through article slug in path)
        db.select({
          category: categories.name,
          color:    categories.color,
          n:        count(),
        })
          .from(pageViews)
          .innerJoin(articles, sql`${pageViews.path} = '/article/' || ${articles.slug}`)
          .innerJoin(categories, eq(articles.categoryId, categories.id))
          .where(where)
          .groupBy(categories.name, categories.color)
          .orderBy(desc(count()))
          .limit(8),

        // 12. Trending articles — last 24h vs prior 24h
        db.select({
          path:     pageViews.path,
          recent:   sql<number>`SUM(CASE WHEN ${pageViews.createdAt} >= datetime('now', '-24 hours') THEN 1 ELSE 0 END)`.as("recent"),
          previous: sql<number>`SUM(CASE WHEN ${pageViews.createdAt} < datetime('now', '-24 hours') THEN 1 ELSE 0 END)`.as("previous"),
        })
          .from(pageViews)
          .where(sql`${pageViews.createdAt} >= datetime('now', '-48 hours') AND ${pageViews.path} LIKE '/article/%'`)
          .groupBy(pageViews.path)
          .orderBy(sql`recent DESC`)
          .limit(8),
      ])
    );

    // 13. New vs returning visitors (sequential — needs uniqueVisitors first)
    const uniqueVisitors = Number(uniqueVisitorsRes[0]?.n ?? 0);
    const pStart = periodStartExpr(period);

    const [returningRes] = await withRetry(() =>
      Promise.all([
        db.select({ n: sql<number>`count(distinct ${pageViews.sessionId})` })
          .from(pageViews)
          .where(sql`(${where}) AND ${pageViews.sessionId} IN (
            SELECT DISTINCT session_id FROM page_views
            WHERE created_at < ${sql.raw(pStart)}
          )`),
      ])
    );
    const returning   = Number(returningRes[0]?.n ?? 0);
    const newVisitors = Math.max(0, uniqueVisitors - returning);

    // Fill hourly gaps with 0
    const hourlyMap = new Map<number, number>();
    for (const r of hourlyRes) hourlyMap.set(r.hour, r.n);
    const hourly = Array.from({ length: 24 }, (_, h) => ({ hour: h, n: hourlyMap.get(h) ?? 0 }));

    // Enrich trending with article titles
    const trendingSlugs = trendingRes
      .map((r) => r.path.replace("/article/", ""))
      .filter(Boolean);

    const titleMap: Record<string, string> = {};
    if (trendingSlugs.length > 0) {
      const rows = await withRetry(() =>
        db.select({ slug: articles.slug, title: articles.title })
          .from(articles)
          .where(inArray(articles.slug, trendingSlugs))
      ).catch(() => []);
      for (const r of rows) titleMap[r.slug] = r.title;
    }

    return {
      totalViews:      totalViewsRes[0]?.n ?? 0,
      uniqueVisitors,
      realtimeViews:   realtimeRes[0]?.n ?? 0,
      topPages:        topPagesRes,
      sources:         sourcesRes,
      countries:       countriesRes.map((r) => ({
        code:  r.code,
        label: countryName(r.code),
        n:     r.n,
      })),
      devices:   devicesRes,
      browsers:  browsersRes,
      daily:     dailyRes,
      hourly,
      categories: categoryRes,
      trending: trendingRes.map((r) => {
        const slug   = r.path.replace("/article/", "");
        const title  = titleMap[slug] ?? slug.replace(/-/g, " ");
        const recent   = Number(r.recent);
        const previous = Number(r.previous);
        const growth   = previous === 0
          ? (recent > 0 ? 100 : 0)
          : Math.round(((recent - previous) / previous) * 100);
        return { path: r.path, title, recent, previous, growth };
      }),
      newVsReturning: [
        { label: "New Visitors",       n: newVisitors },
        { label: "Returning Visitors", n: returning   },
      ],
    };
  });
