import { NextResponse } from "next/server";

// [SMART FEATURES] Shopify product webhook handler — uncomment when smart features are enabled
// Full implementation handles products/create, products/update, products/delete
// with HMAC verification and embedding generation.
// See git history for full code.
// [/SMART FEATURES]

// Stub — returns 200 with disabled status
export async function POST() {
  return NextResponse.json({ ok: true, status: "disabled" });
}
