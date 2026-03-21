/**
 * Product Search — Find purchase links for AI-detected products
 *
 * For MVP, constructs direct search URLs on major e-commerce platforms.
 * Picks the best platform based on product category.
 */

const PLATFORM_URLS = {
  amazon: (q) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}`,
  flipkart: (q) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`,
  google: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}+buy+online&tbm=shop`,
  myntra: (q) => `https://www.myntra.com/${encodeURIComponent(q.replace(/ /g, "-"))}`,
  nykaa: (q) => `https://www.nykaa.com/search/result/?q=${encodeURIComponent(q)}`,
};

// Best platform per product category
const CATEGORY_PLATFORM = {
  food: "google",
  clothing: "myntra",
  shoes: "myntra",
  accessories: "amazon",
  electronics: "amazon",
  beauty: "nykaa",
  home: "amazon",
  fitness: "amazon",
  other: "amazon",
};

/**
 * Get all search links for a product query across platforms.
 * @param {string} query - Search query
 * @returns {Object<string, string>} platform → URL map
 */
export function getProductSearchLinks(query) {
  const result = {};
  for (const [platform, fn] of Object.entries(PLATFORM_URLS)) {
    result[platform] = fn(query);
  }
  return result;
}

/**
 * Get the best purchase link for a product based on its category.
 *
 * @param {string} searchQuery - The search query to find the product
 * @param {string} productName - Product name (fallback query)
 * @param {string} category - Product category (food, clothing, shoes, etc.)
 * @returns {{ url: string, platform: string }}
 */
export function searchProductLink(searchQuery, productName, category) {
  const query = searchQuery || productName || "product";
  const platform = CATEGORY_PLATFORM[category] || "amazon";
  const urlFn = PLATFORM_URLS[platform] || PLATFORM_URLS.amazon;

  return {
    url: urlFn(query),
    platform,
  };
}
