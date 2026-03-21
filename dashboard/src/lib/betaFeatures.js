/**
 * Beta Features Configuration
 *
 * Data-driven config for all upcoming/commented-out features.
 * Used by Coming Soon page, sidebar badges, and teaser cards.
 */

export const BETA_FEATURES = {
  "ai-product-detection": {
    title: "AI product detection",
    icon: "Sparkles",
    status: "Coming Q2 2026",
    statusColor: "teal",
    headline: "AI that spots products in every reel",
    description:
      "When someone shares a reel with you, AI will automatically identify the product shown — shoes, clothing, food, electronics — and send a purchase link. No manual work needed.",
    capabilities: [
      "Identifies products from reel thumbnails using AI vision",
      "Sends purchase links automatically via DM",
      "Tracks every click with detailed analytics",
      "Works with your Shopify catalog (when connected)",
      "Multi-model AI cascade for speed and accuracy",
    ],
  },
  "smart-links": {
    title: "Smart link tracking",
    icon: "Link2",
    status: "Coming Q2 2026",
    statusColor: "teal",
    headline: "Every link tracked. Every click measured.",
    description:
      "All product links sent through Engagr are wrapped in tracked URLs. See real-time click analytics — devices, countries, conversion rates — right from your dashboard.",
    capabilities: [
      "Automatic link wrapping for all DM links",
      "Click analytics: devices, countries, browsers",
      "Unique vs repeat click tracking",
      "Daily click trends and performance charts",
      "Override with your own affiliate links",
    ],
  },
  shopify: {
    title: "Shopify integration",
    icon: "ShoppingBag",
    status: "Coming Q2 2026",
    statusColor: "teal",
    headline: "Your Shopify store, connected to your DMs",
    description:
      "Sync your product catalog so AI can recommend YOUR products in conversations. Prices, images, availability — all pulled directly from your store.",
    capabilities: [
      "One-click Shopify OAuth connection",
      "Automatic daily product catalog sync",
      "AI recommends products from your actual inventory",
      "Product cards with images and prices in DMs",
      "Inventory-aware — only recommends in-stock items",
    ],
  },
  "smart-replies": {
    title: "AI smart replies",
    icon: "Brain",
    status: "Coming Q3 2026",
    statusColor: "indigo",
    headline: "AI support that knows your business",
    description:
      "AI reads your product catalog and knowledge base to answer customer questions automatically. Product inquiries, order status, FAQs — handled 24/7 in your brand voice.",
    capabilities: [
      "Intent detection: product, support, recommendation, order",
      "Grounded in YOUR data — never makes things up",
      "Multi-turn conversations with memory",
      "Automatic handoff to human when needed",
      "Configurable tone: friendly, professional, casual",
    ],
  },
  "knowledge-base": {
    title: "Knowledge base",
    icon: "BookOpen",
    status: "Coming Q3 2026",
    statusColor: "indigo",
    headline: "Train your AI with your business data",
    description:
      "Upload PDFs, add website URLs. AI learns your return policies, FAQs, product details, and brand guidelines — then uses that knowledge to help your customers.",
    capabilities: [
      "Upload PDF documents (up to 10MB)",
      "Scrape and index website pages",
      "AI-powered semantic search across all documents",
      "Test chat to preview AI answers before going live",
      "Auto-refresh for website URLs",
    ],
  },
  conversations: {
    title: "Conversation management",
    icon: "MessageCircle",
    status: "Coming Q3 2026",
    statusColor: "indigo",
    headline: "See every AI conversation in one place",
    description:
      "Monitor all AI-handled conversations. See what customers are asking, how AI is responding, and jump in when a conversation needs a human touch.",
    capabilities: [
      "Full conversation thread view",
      "Status tracking: active, handed off, closed",
      "Intent classification per message",
      "Products and knowledge chunks referenced",
      "One-click handoff to human support",
    ],
  },
  "advanced-analytics": {
    title: "Advanced analytics",
    icon: "BarChart3",
    status: "Coming Q4 2026",
    statusColor: "gray",
    headline: "Deep insights into your Instagram engagement",
    description:
      "Engagement trends, best-performing posts, peak comment times, full conversion funnels, and exportable reports. Know exactly what's working.",
    capabilities: [
      "Engagement rate trends over time",
      "Best performing posts by DM conversions",
      "Peak comment time analysis",
      "Full funnel: comment → DM → click → conversion",
      "Exportable PDF and CSV reports",
    ],
  },
  "api-access": {
    title: "API access",
    icon: "Code",
    status: "Coming Q4 2026",
    statusColor: "gray",
    headline: "Build on top of Engagr",
    description:
      "Get API access to Engagr's features. Build custom integrations, connect to your CRM, or automate workflows with your own tools.",
    capabilities: [
      "RESTful API with full documentation",
      "API key management in dashboard",
      "Webhook forwarding to your endpoints",
      "Rate-limited access (1,000 req/hour)",
      "SDKs for popular languages",
    ],
  },
  payments: {
    title: "Subscription plans",
    icon: "CreditCard",
    status: "Coming soon",
    statusColor: "teal",
    headline: "Flexible plans for every creator",
    description:
      "Choose from Silver, Gold, or Platinum plans. Currently all features are free during early access — paid plans launch soon with DM quotas, multi-account support tiers, and premium features.",
    capabilities: [
      "Silver: 10,000 DMs/month, 1 account",
      "Gold: 50,000 DMs/month, 3 accounts",
      "Platinum: Unlimited DMs, 5 accounts",
      "DM top-up packs available",
      "Early access users get special pricing",
    ],
  },
};

/**
 * Home page teaser cards — the 4 most exciting upcoming features.
 */
export const HOME_TEASERS = [
  { slug: "ai-product-detection", shortDesc: "AI identifies products in shared reels" },
  { slug: "shopify", shortDesc: "Sell your products directly in DMs" },
  { slug: "smart-replies", shortDesc: "24/7 AI customer support" },
  { slug: "knowledge-base", shortDesc: "Train AI with your business docs" },
];
