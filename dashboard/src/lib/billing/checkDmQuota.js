// [PAYMENTS DISABLED] Uncomment when ready to enable usage-based billing
//
// const PLAN_DM_LIMITS = {
//   early_access: Infinity, trial: Infinity,
//   silver: 10000, gold: 50000, platinum: Infinity,
// };
//
// const OVERAGE_PRICE = { silver: "₹0.10", gold: "₹0.05" };
//
// /**
//  * Check if a user is approaching or has exceeded their DM limit.
//  *
//  * @param {Object} user - User document
//  * @returns {{ allowed: boolean, warning: string|null, remaining: number, overageActive: boolean, usagePercent: number }}
//  */
// export function checkDmQuotaWithOverage(user) {
//   const plan = user.subscription?.plan || "early_access";
//
//   if (plan === "early_access" || plan === "platinum") {
//     return { allowed: true, warning: null, remaining: Infinity, overageActive: false, usagePercent: 0 };
//   }
//
//   const limit = PLAN_DM_LIMITS[plan] || 10000;
//   const used = user.usage?.dmsSentThisMonth || 0;
//   const remaining = Math.max(0, limit - used);
//   const usagePercent = (used / limit) * 100;
//   const overageActive = !!user.subscription?.dodoCustomerId;
//
//   let warning = null;
//   if (usagePercent >= 100) {
//     warning = overageActive
//       ? `You've exceeded your ${limit.toLocaleString()} DM limit. Overage DMs billed at ${OVERAGE_PRICE[plan] || "₹0.10"}/DM.`
//       : `You've reached your ${limit.toLocaleString()} DM limit for this month.`;
//   } else if (usagePercent >= 90) {
//     warning = `You've used ${usagePercent.toFixed(0)}% of your DM limit (${used.toLocaleString()}/${limit.toLocaleString()}).`;
//   } else if (usagePercent >= 75) {
//     warning = `${remaining.toLocaleString()} DMs remaining this month.`;
//   }
//
//   return {
//     allowed: overageActive || used < limit,
//     warning,
//     remaining,
//     overageActive,
//     usagePercent: Math.min(100, usagePercent),
//   };
// }
// [/PAYMENTS DISABLED]

// Stub — active while payments are disabled (always allow)
export function checkDmQuotaWithOverage() {
  return { allowed: true, warning: null, remaining: Infinity, overageActive: false, usagePercent: 0 };
}
