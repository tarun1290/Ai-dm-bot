import { NextResponse } from "next/server";

// [SMART FEATURES] Shopify OAuth callback — uncomment when smart features are enabled
// import dbConnect from "@/lib/dbConnect";
// import ShopifyStore from "@/models/ShopifyStore";
// import User from "@/models/User";
// import { verifyState, exchangeCodeForToken, fetchStoreInfo } from "@/lib/shopify/oauth";
// import { syncShopifyProducts } from "@/lib/shopify/sync";
//
// export async function GET(request) {
//   const { searchParams } = new URL(request.url);
//   const code = searchParams.get("code");
//   const shop = searchParams.get("shop");
//   const state = searchParams.get("state");
//
//   if (!code || !shop || !state) {
//     return NextResponse.redirect(new URL("/dashboard?shopify=error&reason=missing_params", request.url));
//   }
//
//   try {
//     const { userId, accountId } = await verifyState(state);
//     await dbConnect();
//     const user = await User.findOne({ userId }).lean();
//     if (!user?.flags?.shopifyEnabled) {
//       return NextResponse.redirect(new URL("/dashboard?shopify=error&reason=not_enabled", request.url));
//     }
//     const { accessToken, scope } = await exchangeCodeForToken(shop, code);
//     const storeInfo = await fetchStoreInfo(shop, accessToken);
//     const store = await ShopifyStore.findOneAndUpdate(
//       { shopDomain: shop },
//       { $set: { userId, accountId, accessToken, storeName: storeInfo.name, storeEmail: storeInfo.email, storeCurrency: storeInfo.currency, scopes: scope ? scope.split(",") : [], isConnected: true, connectedAt: new Date(), disconnectedAt: null, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
//       { upsert: true, returnDocument: "after" }
//     );
//     syncShopifyProducts(store._id.toString()).catch(console.error);
//     const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://engagr-dm.vercel.app";
//     return NextResponse.redirect(`${appUrl}/dashboard?shopify=success&store=${encodeURIComponent(storeInfo.name)}`);
//   } catch (error) {
//     console.error("[Shopify Callback] Error:", error.message);
//     const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://engagr-dm.vercel.app";
//     return NextResponse.redirect(`${appUrl}/dashboard?shopify=error&reason=${encodeURIComponent(error.message)}`);
//   }
// }
// [/SMART FEATURES]

// Stub — returns disabled status while smart features are off
export async function GET() {
  return NextResponse.json({ status: "disabled" });
}
