# Engagr — Smart Features Setup

These features are admin-gated and invisible to users unless enabled.

## Prerequisites
- MongoDB Atlas cluster (for Vector Search)
- OpenAI API key (for embeddings)
- Shopify Partner account (for Shopify integration)

---

## MongoDB Atlas Vector Search Indexes

These must be created manually in the Atlas dashboard — they cannot be created via Mongoose.

### Steps:
1. Go to **Atlas → your cluster → Search tab → Create Search Index**
2. Choose **"JSON Editor"** and create two indexes:

### Index 1 — Product Vector Search

- **Collection:** `shopifyproducts`
- **Index name:** `product_vector_index`
- **Definition:**
```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "userId"
    }
  ]
}
```

### Index 2 — Knowledge Vector Search

- **Collection:** `knowledgechunks`
- **Index name:** `knowledge_vector_index`
- **Definition:**
```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "userId"
    },
    {
      "type": "filter",
      "path": "accountId"
    }
  ]
}
```

---

## Shopify App Setup

1. Go to [partners.shopify.com](https://partners.shopify.com) → Create app
2. Set app type: **Custom app** (or Public app for multi-tenant)
3. Set redirect URL: `https://your-domain.com/api/auth/shopify/callback`
4. Request scopes: `read_products, read_orders, read_customers`
5. Copy API key and secret to environment variables:
   - `SHOPIFY_API_KEY`
   - `SHOPIFY_API_SECRET`
6. Set `SHOPIFY_SCOPES=read_products,read_orders,read_customers`

### Webhook Registration (optional, for real-time updates)
After a store connects, register webhooks via Shopify Admin API:
```
POST https://{shop}/admin/api/2024-01/webhooks.json
{
  "webhook": {
    "topic": "products/create",
    "address": "https://your-domain.com/api/webhooks/shopify",
    "format": "json"
  }
}
```
Repeat for: `products/update`, `products/delete`

---

## OpenAI Embeddings Setup

1. Get an API key from [platform.openai.com](https://platform.openai.com)
2. Set `EMBEDDING_API_KEY` in environment variables
3. Default model: `text-embedding-3-small` (~$0.02/1M tokens)
4. Dimensions: 1536 (matching the Atlas vector indexes)

---

## Environment Variables

```
# Shopify
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOPIFY_SCOPES=read_products,read_orders,read_customers

# Embeddings
EMBEDDING_API_KEY=your_openai_api_key
EMBEDDING_MODEL=text-embedding-3-small
```

---

## Admin Feature Flags

These flags control access (all default to `false`):

### User model (`flags`):
- `shopifyEnabled` — allows Shopify OAuth + product sync
- `knowledgeBaseEnabled` — allows document upload + URL scraping
- `smartRepliesEnabled` — allows AI-powered conversation threads

### InstagramAccount model (`smartFeatures`):
- `shopifyConnected` — Shopify store linked to this IG account
- `knowledgeBaseActive` — knowledge base active for this account
- `smartRepliesActive` — smart replies active for this account

Admin enables these from the admin dashboard. All server actions check the flag before executing.

---

## Limits Per Account

- Max 10 documents per account (PDFs + URLs combined)
- Max 5 URLs per account
- Max 10MB per PDF file
- Max 500 knowledge chunks per account
- Shopify: syncs all active products (no limit)

---

## Cron Jobs

Added to existing `/api/cron/subscription-management`:

| Task | Schedule | Description |
|------|----------|-------------|
| Shopify sync | Daily | Re-syncs all connected Shopify stores |
| Knowledge URL refresh | Weekly (Sundays) | Re-scrapes and re-processes URL sources |
| Thread cleanup | Daily | Closes expired conversation threads (24h window) |

---

## Files Created

### Models (5 new):
- `src/models/ShopifyStore.js`
- `src/models/ShopifyProduct.js`
- `src/models/KnowledgeDocument.js`
- `src/models/KnowledgeChunk.js`
- `src/models/ConversationThread.js`

### Utilities (5 new):
- `src/lib/embeddings.js` — OpenAI embedding generation
- `src/lib/vectorSearch.js` — MongoDB Atlas Vector Search
- `src/lib/knowledge/chunker.js` — Text chunking + HTML stripping
- `src/lib/knowledge/processor.js` — PDF parsing + URL scraping + embedding pipeline
- `src/lib/shopify/oauth.js` — Shopify OAuth flow
- `src/lib/shopify/sync.js` — Shopify product catalog sync

### API Routes (2 new):
- `src/app/api/auth/shopify/callback/route.js` — Shopify OAuth callback
- `src/app/api/webhooks/shopify/route.js` — Shopify product webhooks

### Server Actions (1 new file):
- `src/app/dashboard/smart-actions.js` — All smart feature server actions

### Modified Files:
- `src/models/User.js` — Added flags: shopifyEnabled, knowledgeBaseEnabled, smartRepliesEnabled
- `src/models/InstagramAccount.js` — Added smartFeatures object
- `src/app/api/cron/subscription-management/route.js` — Added Shopify sync, knowledge refresh, thread cleanup
- `.env.local` — Added Shopify + embedding env vars
