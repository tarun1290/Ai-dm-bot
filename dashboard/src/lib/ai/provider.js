/**
 * AI Vision Provider — Abstraction Layer
 *
 * Provider-agnostic interface for image analysis.
 * Supports: Claude (Anthropic), OpenAI GPT-4o, Google Gemini
 * Set AI_VISION_PROVIDER env var to choose: "claude" | "openai" | "gemini"
 */

const PRODUCT_DETECTION_PROMPT = `
Analyze this image from an Instagram reel. Identify ALL purchasable products, items, dishes, clothing, accessories, or items visible.

For each product found, provide:
1. name: specific product name (e.g. "Nike Air Max 90" not just "shoes")
2. category: one of: food, clothing, shoes, accessories, electronics, beauty, home, fitness, other
3. brand: brand name if visible/identifiable, null otherwise
4. description: brief visual description (color, style, distinguishing features)
5. confidence: how confident you are this is correct (0.0 to 1.0)
6. suggestedSearchQuery: the best search query to find this exact product for purchase online

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "products": [...],
  "sceneDescription": "brief description of the scene"
}

If no purchasable products are visible, return: { "products": [], "sceneDescription": "..." }
`;

// Estimated cost per call (USD) for tracking
const COST_ESTIMATES = {
  claude: 0.007,
  openai: 0.01,
  gemini: 0.003,
};

/**
 * Parse AI JSON response, handling potential markdown wrapping
 */
function parseJsonResponse(text) {
  let clean = text.trim();
  // Strip markdown code fences if present
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }
  try {
    return JSON.parse(clean);
  } catch {
    return { products: [], sceneDescription: "Failed to parse AI response" };
  }
}

/**
 * Normalize AI response to standard shape
 */
function normalizeResponse(parsed, rawResponse, provider, model) {
  const products = (parsed.products || []).map((p) => ({
    name: p.name || "Unknown product",
    category: p.category || "other",
    brand: p.brand || null,
    description: p.description || "",
    confidence: typeof p.confidence === "number" ? p.confidence : 0.5,
    suggestedSearchQuery: p.suggestedSearchQuery || p.name || "",
  }));

  return {
    products,
    sceneDescription: parsed.sceneDescription || "",
    rawResponse,
    provider,
    model,
    estimatedCost: COST_ESTIMATES[provider] || 0.01,
  };
}

// ── Claude (Anthropic) ──────────────────────────────────────────────────────

async function analyzeWithClaude(imageUrl) {
  const apiKey = process.env.AI_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("AI_ANTHROPIC_API_KEY not configured");

  const model = "claude-sonnet-4-20250514";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "url", url: imageUrl } },
            { type: "text", text: PRODUCT_DETECTION_PROMPT },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || "";
  const parsed = parseJsonResponse(text);

  return normalizeResponse(parsed, data, "claude", model);
}

// ── OpenAI GPT-4o ───────────────────────────────────────────────────────────

async function analyzeWithOpenAI(imageUrl) {
  const apiKey = process.env.AI_OPENAI_API_KEY;
  if (!apiKey) throw new Error("AI_OPENAI_API_KEY not configured");

  const model = "gpt-4o";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: imageUrl } },
            { type: "text", text: PRODUCT_DETECTION_PROMPT },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  const parsed = parseJsonResponse(text);

  return normalizeResponse(parsed, data, "openai", model);
}

// ── Google Gemini ───────────────────────────────────────────────────────────

async function analyzeWithGemini(imageUrl) {
  const apiKey = process.env.AI_GEMINI_API_KEY;
  if (!apiKey) throw new Error("AI_GEMINI_API_KEY not configured");

  const model = "gemini-2.0-flash";

  // Fetch image as base64 for Gemini
  let imageData, mimeType;
  try {
    const imgRes = await fetch(imageUrl);
    const buffer = await imgRes.arrayBuffer();
    imageData = Buffer.from(buffer).toString("base64");
    mimeType = imgRes.headers.get("content-type") || "image/jpeg";
  } catch {
    throw new Error("Failed to fetch image for Gemini analysis");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inline_data: { mime_type: mimeType, data: imageData } },
              { text: PRODUCT_DETECTION_PROMPT },
            ],
          },
        ],
        generationConfig: { maxOutputTokens: 1000 },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const parsed = parseJsonResponse(text);

  return normalizeResponse(parsed, data, "gemini", model);
}

// ── Provider Selector ───────────────────────────────────────────────────────

const AI_PROVIDER = process.env.AI_VISION_PROVIDER || "claude";

/**
 * Analyze an image for purchasable products.
 * @param {string} imageUrl - URL of the image to analyze
 * @returns {Promise<{ products, sceneDescription, rawResponse, provider, model, estimatedCost }>}
 */
export async function analyzeProductInImage(imageUrl) {
  switch (AI_PROVIDER) {
    case "claude":
      return analyzeWithClaude(imageUrl);
    case "openai":
      return analyzeWithOpenAI(imageUrl);
    case "gemini":
      return analyzeWithGemini(imageUrl);
    default:
      throw new Error(`Unknown AI provider: ${AI_PROVIDER}`);
  }
}

export { AI_PROVIDER, COST_ESTIMATES };
