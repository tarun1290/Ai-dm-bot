// [PAYMENTS DISABLED] Uncomment when ready to enable usage-based billing via Dodo Payments
//
// /**
//  * Report a DM send event to Dodo Payments for usage-based billing.
//  * Called after every successful DM send in the webhook handler.
//  * Fire-and-forget — never blocks the DM flow.
//  *
//  * @param {string} dodoCustomerId - The user's Dodo customer ID
//  * @param {Object} metadata - Additional context
//  */
// export async function reportDmUsage(dodoCustomerId, metadata = {}) {
//   if (!process.env.DODO_PAYMENTS_API_KEY || !dodoCustomerId) return;
//
//   try {
//     const eventId = `dm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     const baseUrl = process.env.NODE_ENV === "production"
//       ? "https://api.dodopayments.com"
//       : "https://test.dodopayments.com";
//
//     const response = await fetch(`${baseUrl}/events/ingest`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         events: [{
//           event_id: eventId,
//           customer_id: dodoCustomerId,
//           event_name: "dm.sent",
//           timestamp: new Date().toISOString(),
//           metadata: {
//             account_id: metadata.accountId || "",
//             trigger_type: metadata.triggerType || "comment_dm",
//             instagram_username: metadata.instagramUsername || "",
//             recipient_id: metadata.recipientId || "",
//           },
//         }],
//       }),
//     });
//
//     if (!response.ok) {
//       console.error("[Dodo Usage] Failed to report DM event:", response.status);
//     }
//   } catch (error) {
//     console.error("[Dodo Usage] Error:", error.message);
//   }
// }
// [/PAYMENTS DISABLED]

// Stub — active while payments are disabled
export async function reportDmUsage() {}
