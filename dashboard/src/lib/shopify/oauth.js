// [SMART FEATURES] Uncomment when Shopify + Knowledge Base + Smart Replies are enabled
// /**
//  * Shopify OAuth Utilities
//  *
//  * Handles OAuth flow: authorization URL generation and token exchange.
//  */
//
// import { SignJWT, jwtVerify } from "jose";
//
// const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
// const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
// const SHOPIFY_SCOPES = process.env.SHOPIFY_SCOPES || "read_products";
// const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
//
// /**
//  * Validate a Shopify domain format.
//  * @param {string} domain
//  * @returns {boolean}
//  */
// export function isValidShopDomain(domain) {
//   return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(domain);
// }
//
// /**
//  * Build the Shopify OAuth authorization URL.
//  * @param {string} shopDomain - e.g. "mystore.myshopify.com"
//  * @param {string} userId - Engagr user ID
//  * @param {string} accountId - InstagramAccount._id
//  * @returns {Promise<string>} Authorization URL
//  */
// export async function buildAuthUrl(shopDomain, userId, accountId) {
//   if (!SHOPIFY_API_KEY) throw new Error("SHOPIFY_API_KEY not configured");
//
//   const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://engagr-dm.vercel.app";
//   const redirectUri = `${appUrl}/api/auth/shopify/callback`;
//
//   // Sign state JWT with userId + accountId for secure callback verification
//   const state = await new SignJWT({ userId, accountId })
//     .setProtectedHeader({ alg: "HS256" })
//     .setExpirationTime("10m")
//     .sign(JWT_SECRET);
//
//   const params = new URLSearchParams({
//     client_id: SHOPIFY_API_KEY,
//     scope: SHOPIFY_SCOPES,
//     redirect_uri: redirectUri,
//     state,
//   });
//
//   return `https://${shopDomain}/admin/oauth/authorize?${params.toString()}`;
// }
//
// /**
//  * Verify the state JWT from the OAuth callback.
//  * @param {string} state - JWT from query params
//  * @returns {Promise<{ userId: string, accountId: string }>}
//  */
// export async function verifyState(state) {
//   const { payload } = await jwtVerify(state, JWT_SECRET);
//   return { userId: payload.userId, accountId: payload.accountId };
// }
//
// /**
//  * Exchange the OAuth code for a permanent access token.
//  * @param {string} shopDomain
//  * @param {string} code
//  * @returns {Promise<{ accessToken: string, scope: string }>}
//  */
// export async function exchangeCodeForToken(shopDomain, code) {
//   const response = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       client_id: SHOPIFY_API_KEY,
//       client_secret: SHOPIFY_API_SECRET,
//       code,
//     }),
//   });
//
//   if (!response.ok) {
//     const err = await response.text();
//     throw new Error(`Shopify token exchange failed: ${err}`);
//   }
//
//   const data = await response.json();
//   return {
//     accessToken: data.access_token,
//     scope: data.scope,
//   };
// }
//
// /**
//  * Fetch store information from Shopify.
//  * @param {string} shopDomain
//  * @param {string} accessToken
//  * @returns {Promise<Object>} Store data
//  */
// export async function fetchStoreInfo(shopDomain, accessToken) {
//   const response = await fetch(`https://${shopDomain}/admin/api/2024-01/shop.json`, {
//     headers: { "X-Shopify-Access-Token": accessToken },
//   });
//
//   if (!response.ok) throw new Error("Failed to fetch store info");
//
//   const { shop } = await response.json();
//   return {
//     name: shop.name,
//     email: shop.email,
//     currency: shop.currency,
//     domain: shop.myshopify_domain,
//   };
// }
// [/SMART FEATURES]

// Stub — active while smart features are disabled
export function isValidShopDomain(_domain) { return { error: 'disabled' }; }
export async function buildAuthUrl(_shopDomain, _userId, _accountId) { return { error: 'disabled' }; }
export async function verifyState(_state) { return { error: 'disabled' }; }
export async function exchangeCodeForToken(_shopDomain, _code) { return { error: 'disabled' }; }
export async function fetchStoreInfo(_shopDomain, _accessToken) { return { error: 'disabled' }; }
