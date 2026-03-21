# Engagr — Smart Features Activation Checklist

Shopify + Knowledge Base + Smart Replies are commented out with `[SMART FEATURES]` tags.
The app currently runs without these features — they are completely invisible to all users.

## Prerequisites

- [ ] MongoDB Atlas Vector Search indexes created (see SMART_FEATURES_SETUP.md)
- [ ] Shopify Partner account created at partners.shopify.com
- [ ] Shopify app created with redirect URL configured
- [ ] OpenAI API key for embeddings (text-embedding-3-small)
- [ ] AI provider configured (Claude/OpenAI/Gemini API key)
- [ ] Environment variables set:
  - `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_SCOPES`
  - `EMBEDDING_API_KEY`, `EMBEDDING_MODEL`
  - AI vision provider keys (existing)

## Step 1: Create Vector Search Indexes

- [ ] Create `product_vector_index` on `shopifyproducts` collection in Atlas
- [ ] Create `knowledge_vector_index` on `knowledgechunks` collection in Atlas
- [ ] Follow SMART_FEATURES_SETUP.md for exact index definitions

## Step 2: Uncomment Backend Utilities (Prompt 1)

- [ ] `src/lib/embeddings.js` — Remove stubs, uncomment `generateEmbedding` + `generateEmbeddings`
- [ ] `src/lib/vectorSearch.js` — Remove stub, uncomment `vectorSearch`
- [ ] `src/lib/knowledge/chunker.js` — Remove stub, uncomment `chunkText`
- [ ] `src/lib/knowledge/processor.js` — Remove stubs, uncomment `processDocument` + `refreshUrlDocument`
- [ ] `src/lib/shopify/oauth.js` — Remove stubs, uncomment all 5 OAuth functions
- [ ] `src/lib/shopify/sync.js` — Remove stub, uncomment `syncShopifyProducts`

## Step 3: Uncomment API Routes (Prompt 1)

- [ ] `src/app/api/auth/shopify/callback/route.js` — Remove stub GET handler, uncomment full OAuth callback
- [ ] `src/app/api/webhooks/shopify/route.js` — Remove stub POST handler, uncomment full webhook handler

## Step 4: Uncomment Cron Tasks (Prompt 1)

- [ ] `src/app/api/cron/subscription-management/route.js` — Uncomment imports (ShopifyStore, KnowledgeDocument, ConversationThread, syncShopifyProducts, refreshUrlDocument)
- [ ] Same file — Uncomment sections 5 (Shopify sync), 6 (Knowledge URL refresh), 7 (Conversation cleanup)
- [ ] Add `shopifySynced`, `knowledgeRefreshed`, `threadsClosed` back to results object

## Step 5: Uncomment AI Smart Reply Engine (Prompt 2)

- [ ] `src/lib/smartReply/aiCaller.js` — Remove stub, uncomment `callAI` + all provider functions
- [ ] `src/lib/smartReply/intentClassifier.js` — Remove stub, uncomment `classifyIntent`
- [ ] `src/lib/smartReply/contextRetriever.js` — Remove stub, uncomment `retrieveContext`
- [ ] `src/lib/smartReply/replyGenerator.js` — Remove stub, uncomment `generateSmartReply`
- [ ] `src/lib/smartReply/handoff.js` — Remove stub, uncomment `shouldHandOff`
- [ ] `src/lib/smartReply/pipeline.js` — Remove stub, uncomment `runSmartReplyPipeline`

## Step 6: Uncomment Webhook Integration (Prompt 2)

- [ ] `src/app/api/webhook/route.js` — Uncomment `import { runSmartReplyPipeline }` (line 11)
- [ ] Same file — Uncomment the Smart Reply Pipeline block in the plain text DM handler (~line 1013)

## Step 7: Uncomment Frontend (Prompt 3)

- [ ] `src/components/Sidebar.js` — Uncomment Knowledge + Conversations sidebar items (line 71-73)
- [ ] `src/app/dashboard/page.js` — Uncomment KnowledgeBasePage + ConversationsPage imports (line 39-41)
- [ ] Same file — Uncomment Knowledge + Conversations tab cases in renderContent (line 838-842)
- [ ] Same file — Pass `smartFeatures={stats.smartFeaturesEnabled}` to `<Automation>` component
- [ ] `src/components/Automation.js` — Uncomment smart-actions import (line 10)
- [ ] Same file — Add `smartFeatures = {}` to function params
- [ ] Same file — Uncomment smart reply state variables (line 74-80)
- [ ] Same file — Uncomment smart reply data loading in useEffect (line 126-137)
- [ ] Same file — Uncomment smart reply save handler (line 175-181)
- [ ] Same file — Restore AI Smart Replies JSX section from git history (before Publish button)

## Step 8: Enable for Test User

- [ ] Go to admin dashboard
- [ ] Find your test user
- [ ] Set `flags.shopifyEnabled = true`
- [ ] Set `flags.knowledgeBaseEnabled = true`
- [ ] Set `flags.smartRepliesEnabled = true`
- [ ] Set `smartFeatures.smartRepliesActive = true` on their InstagramAccount
- [ ] Connect a Shopify store from Settings page
- [ ] Upload a test PDF to Knowledge Base
- [ ] Add a website URL to Knowledge Base
- [ ] Enable smart replies on Automation page
- [ ] Send a test DM to the connected Instagram account
- [ ] Verify AI replies with product/knowledge context

## Step 9: Verify

- [ ] `npm run build` passes with zero errors
- [ ] Knowledge Base page loads and shows documents
- [ ] Conversations page loads and shows threads
- [ ] Smart Reply settings section appears on Automation page
- [ ] Shopify connection section appears on Settings page
- [ ] Knowledge and Conversations items appear in sidebar
- [ ] Reel share detection still works (not broken by smart reply changes)
- [ ] Comment-to-DM automation still works
- [ ] No console errors

## Files with `[SMART FEATURES]` tags:

### Backend Utilities (12 files):
1. `src/lib/embeddings.js` — generateEmbedding + generateEmbeddings stubbed
2. `src/lib/vectorSearch.js` — vectorSearch stubbed
3. `src/lib/knowledge/chunker.js` — chunkText stubbed (stripHtml kept active)
4. `src/lib/knowledge/processor.js` — processDocument + refreshUrlDocument stubbed
5. `src/lib/shopify/oauth.js` — All 5 OAuth functions stubbed
6. `src/lib/shopify/sync.js` — syncShopifyProducts stubbed
7. `src/lib/smartReply/aiCaller.js` — callAI stubbed
8. `src/lib/smartReply/intentClassifier.js` — classifyIntent stubbed
9. `src/lib/smartReply/contextRetriever.js` — retrieveContext stubbed
10. `src/lib/smartReply/replyGenerator.js` — generateSmartReply stubbed
11. `src/lib/smartReply/handoff.js` — shouldHandOff stubbed (templates kept active)
12. `src/lib/smartReply/pipeline.js` — runSmartReplyPipeline stubbed

### API Routes (2 files):
13. `src/app/api/auth/shopify/callback/route.js` — GET returns { status: 'disabled' }
14. `src/app/api/webhooks/shopify/route.js` — POST returns { ok: true, status: 'disabled' }

### Cron Job (1 file):
15. `src/app/api/cron/subscription-management/route.js` — Sections 5, 6, 7 commented out + imports

### Webhook Handler (1 file):
16. `src/app/api/webhook/route.js` — Smart reply pipeline import + integration block commented out

### UI Components (3 files):
17. `src/components/Sidebar.js` — Knowledge + Conversations sidebar items commented out
18. `src/app/dashboard/page.js` — KnowledgeBasePage + ConversationsPage imports + tab cases commented out
19. `src/components/Automation.js` — Smart reply import, state, handlers, and JSX section removed

### NOT commented out (kept active):
- All 5 database models (ShopifyStore, ShopifyProduct, KnowledgeDocument, KnowledgeChunk, ConversationThread)
- User.flags fields (shopifyEnabled, knowledgeBaseEnabled, smartRepliesEnabled)
- InstagramAccount.smartFeatures + smartReplyConfig schema fields
- smart-actions.js server actions (they check flags and return errors if not enabled)
- KnowledgeBasePage.js + ConversationsPage.js components (they exist but are never imported/rendered)
- Environment variable definitions in .env.local
