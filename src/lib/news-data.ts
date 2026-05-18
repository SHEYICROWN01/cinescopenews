export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  category: string;
  categorySlug: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
  tags: string[];
};

const img = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const CATEGORIES = [
  { name: "Politics", slug: "politics" },
  { name: "Business", slug: "business" },
  { name: "Technology", slug: "technology" },
  { name: "Sports", slug: "sports" },
  { name: "Entertainment", slug: "entertainment" },
  { name: "Health", slug: "health" },
  { name: "World", slug: "world" },
  { name: "Opinion", slug: "opinion" },
];

const lorem = [
  "In a development that has reverberated across the corridors of power, sources close to the matter have confirmed a series of high-level discussions aimed at recalibrating policy frameworks. Stakeholders gathered behind closed doors over the weekend, signalling the gravity of the issue at hand.",
  "The implications extend far beyond the immediate parties involved. Analysts who spoke to DailyNewsTap on condition of anonymity described the situation as a defining moment, one that will likely shape the contours of the national conversation in the months ahead.",
  "Speaking at a press briefing in Abuja, the lead spokesperson emphasised that transparency would remain central to all proceedings. \"We are committed to ensuring that every stakeholder is heard,\" he said, adding that consultations would continue through the next quarter.",
  "Critics, however, remain unconvinced. Civil society organisations have called for greater public participation, citing concerns about the pace and direction of the proposed reforms. A coalition of advocacy groups is expected to issue a formal response later this week.",
  "As the situation evolves, observers will be watching closely. The next few weeks promise to be decisive, with announcements expected from both the executive and legislative arms. DailyNewsTap will continue to provide updates as they unfold.",
];

export const ARTICLES: Article[] = [
  {
    slug: "coastal-highway-phase-two",
    title: "The Coastal Connection: How Nigeria's New Highway Aims to Link Six Geo-Political Zones",
    excerpt:
      "The Lagos–Calabar Coastal Highway marks a turning point in regional connectivity. The first 40km is nearing completion as the $13bn infrastructure project enters its second phase.",
    body: lorem,
    category: "Politics",
    categorySlug: "politics",
    author: "Adebayo Yusuf",
    authorRole: "Senior Political Correspondent",
    date: "May 18, 2026",
    readTime: "8 min read",
    image: img("1545419913-775e3e82c7db"),
    featured: true,
    tags: ["Infrastructure", "Federal Government", "Lagos", "Cross River"],
  },
  {
    slug: "cbn-interest-rate-benchmarks",
    title: "CBN Announces New Interest Rate Benchmarks for Commercial Lenders",
    excerpt:
      "The apex bank's monetary policy committee voted unanimously to retain the benchmark rate, citing persistent inflationary pressures and exchange rate volatility.",
    body: lorem,
    category: "Business",
    categorySlug: "business",
    author: "Chinwe Okafor",
    authorRole: "Economics Editor",
    date: "May 18, 2026",
    readTime: "5 min read",
    image: img("1554224155-6726b3ff858f"),
    tags: ["CBN", "Monetary Policy", "Inflation"],
  },
  {
    slug: "yc-nigerian-startups-cohort",
    title: "Y Combinator Selects Four Nigerian Startups for Its Winter Cohort",
    excerpt:
      "The fintech, healthtech and logistics companies join a select group of 220 startups in this year's batch — a record for African representation.",
    body: lorem,
    category: "Technology",
    categorySlug: "technology",
    author: "Tunde Bakare",
    authorRole: "Technology Correspondent",
    date: "May 17, 2026",
    readTime: "6 min read",
    image: img("1556761175-5973dc0f32e7"),
    tags: ["Startups", "Y Combinator", "Venture Capital"],
  },
  {
    slug: "naira-stabilises-dollar",
    title: "Naira Stabilises Against the Dollar as CBN Injects Fresh Liquidity",
    excerpt:
      "Foreign exchange traders reported tighter spreads across both the official and parallel markets following coordinated interventions.",
    body: lorem,
    category: "Business",
    categorySlug: "business",
    author: "Chinwe Okafor",
    authorRole: "Economics Editor",
    date: "May 17, 2026",
    readTime: "4 min read",
    image: img("1611974789855-9c2a0a7236a3"),
    tags: ["Forex", "Naira", "CBN"],
  },
  {
    slug: "super-eagles-afcon-abidjan",
    title: "Super Eagles Arrive in Abidjan Ahead of AFCON Qualifiers",
    excerpt:
      "The squad of 26 players landed in the early hours, with the head coach declaring the team is in peak physical condition for the opening fixture.",
    body: lorem,
    category: "Sports",
    categorySlug: "sports",
    author: "Emeka Obi",
    authorRole: "Sports Editor",
    date: "May 17, 2026",
    readTime: "3 min read",
    image: img("1551958219-acbc608c6377"),
    tags: ["Super Eagles", "AFCON", "Football"],
  },
  {
    slug: "2027-elections-coalition",
    title: "Inside the Strategic Realignments Ahead of the 2027 General Elections",
    excerpt:
      "Opposition leaders convened in Kaduna to discuss coalition strategies as major parties confront mounting internal friction.",
    body: lorem,
    category: "Politics",
    categorySlug: "politics",
    author: "Adebayo Yusuf",
    authorRole: "Senior Political Correspondent",
    date: "May 16, 2026",
    readTime: "9 min read",
    image: img("1529107386315-e1a2ed48a620"),
    tags: ["Elections", "2027", "Politics"],
  },
  {
    slug: "senate-minimum-wage",
    title: "Senate Debates a New Minimum Wage Framework for Civil Servants",
    excerpt:
      "The upper legislative house seeks to balance labour union demands against the fiscal realities of subnational governments.",
    body: lorem,
    category: "Politics",
    categorySlug: "politics",
    author: "Hauwa Ibrahim",
    authorRole: "Parliamentary Reporter",
    date: "May 16, 2026",
    readTime: "5 min read",
    image: img("1555848962-6e79363ec58f"),
    tags: ["Senate", "Labour", "Civil Service"],
  },
  {
    slug: "supreme-court-lg-autonomy",
    title: "Supreme Court Sets Date for Landmark Local Government Autonomy Ruling",
    excerpt:
      "Local council administration hangs in the balance as the apex court prepares its definitive interpretation of the constitution.",
    body: lorem,
    category: "Politics",
    categorySlug: "politics",
    author: "Hauwa Ibrahim",
    authorRole: "Parliamentary Reporter",
    date: "May 15, 2026",
    readTime: "6 min read",
    image: img("1589994965851-a8f479c573a9"),
    tags: ["Supreme Court", "LG Autonomy"],
  },
  {
    slug: "apapa-port-congestion",
    title: "Maritime Congestion Hits New Peak at Apapa as Festive Imports Surge",
    excerpt:
      "Clearing agents warn of significant price hikes on consumer goods as vessel turnaround time stretches beyond historical averages.",
    body: lorem,
    category: "Business",
    categorySlug: "business",
    author: "Ifeoma Nwankwo",
    authorRole: "Trade Correspondent",
    date: "May 15, 2026",
    readTime: "7 min read",
    image: img("1494412651409-8963ce7935a7"),
    tags: ["Apapa Port", "Trade", "Logistics"],
  },
  {
    slug: "lagos-fashion-week-aso-oke",
    title: "Lagos Fashion Week: The Emergence of Ethical Silk and Upcycled Aso-Oke",
    excerpt:
      "This year's showcase moved beyond aesthetics, challenging the industry to rethink its carbon footprint and textile waste.",
    body: lorem,
    category: "Entertainment",
    categorySlug: "entertainment",
    author: "Zainab Lawal",
    authorRole: "Culture Editor",
    date: "May 14, 2026",
    readTime: "4 min read",
    image: img("1469334031218-e382a71b716b"),
    tags: ["Fashion", "Lagos", "Sustainability"],
  },
  {
    slug: "healthcare-drug-subsidy",
    title: "New Healthcare Reform: Federal Government to Subsidise Essential Drugs",
    excerpt:
      "The minister of health outlined a four-year roadmap that promises a 60% price reduction on more than 200 essential medications.",
    body: lorem,
    category: "Health",
    categorySlug: "health",
    author: "Dr. Funke Adeyemi",
    authorRole: "Health Correspondent",
    date: "May 14, 2026",
    readTime: "5 min read",
    image: img("1576091160399-112ba8d25d1d"),
    tags: ["Health", "Policy", "Reform"],
  },
  {
    slug: "uae-nigeria-flights",
    title: "Diplomatic Reset: Nigeria and UAE Restore Direct Flight Corridors",
    excerpt:
      "After a prolonged hiatus, Emirates and Etihad will resume daily flights from Lagos and Abuja beginning next month.",
    body: lorem,
    category: "World",
    categorySlug: "world",
    author: "Kenneth Adamu",
    authorRole: "Foreign Affairs Correspondent",
    date: "May 13, 2026",
    readTime: "4 min read",
    image: img("1436491865332-7a61a109cc05"),
    tags: ["Diplomacy", "UAE", "Aviation"],
  },
  {
    slug: "ai-public-literacy",
    title: "Leveraging Generative Models for Public Literacy in Local Dialects",
    excerpt:
      "A consortium of research universities is translating educational content into more than twenty Nigerian languages using fine-tuned models.",
    body: lorem,
    category: "Technology",
    categorySlug: "technology",
    author: "Tunde Bakare",
    authorRole: "Technology Correspondent",
    date: "May 13, 2026",
    readTime: "8 min read",
    image: img("1677442136019-21780ecad995"),
    tags: ["AI", "Education", "Research"],
  },
  {
    slug: "opinion-urban-heritage",
    title: "We Must Rethink Our Approach to Urban Sprawl Before It's Too Late",
    excerpt:
      "Heritage sites across the country are being swallowed by unchecked development. The cost of inaction grows by the day.",
    body: lorem,
    category: "Opinion",
    categorySlug: "opinion",
    author: "Prof. Julian Marks",
    authorRole: "Guest Columnist",
    date: "May 12, 2026",
    readTime: "6 min read",
    image: img("1480714378408-67cf0d13bc1b"),
    tags: ["Opinion", "Heritage", "Urban Planning"],
  },
];

export const BREAKING: string[] = [
  "CBN announces new interest rate benchmarks for commercial lenders",
  "Federal Government begins Phase 2 of Lagos–Calabar Highway project",
  "Super Eagles arrive in Abidjan ahead of AFCON qualifiers",
  "Senate summons Central Bank Governor over interest rate hikes",
  "Dangote Refinery begins direct supply of PMS to local marketers",
  "Naira stabilises at ₦1,450 against the dollar in parallel market",
];

export const getArticle = (slug: string) => ARTICLES.find((a) => a.slug === slug);
export const byCategory = (slug: string) =>
  ARTICLES.filter((a) => a.categorySlug === slug);
export const related = (slug: string, cat: string) =>
  ARTICLES.filter((a) => a.categorySlug === cat && a.slug !== slug).slice(0, 3);
