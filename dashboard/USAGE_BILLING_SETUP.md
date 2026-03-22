# Engagr — Usage-Based Billing Setup

All usage-based billing code is commented out with `[PAYMENTS DISABLED]` tags.

## Step 1: Create a DM Meter in Dodo Dashboard

1. Go to Dodo Payments Dashboard > Meters
2. Create meter:
   - Name: "DMs Sent"
   - Event name: `dm.sent`
   - Aggregation type: Count
   - Measurement unit: "DMs"
3. Copy the meter ID → set as `DODO_METER_DM_SENT`

## Step 2: Create Usage-Based Overage Products

1. Go to Products > Create Product
2. Type: Usage-Based
3. Associated Meter: select "DMs Sent"
4. Create 2 variants:

**Silver overage:**
- Price per unit: ₹0.10 per DM (₹10 per 100 DMs)
- Free threshold: 10,000 (included in Silver plan)
- Copy product ID → `DODO_PRODUCT_DM_OVERAGE_SILVER`

**Gold overage:**
- Price per unit: ₹0.05 per DM (₹5 per 100 DMs)
- Free threshold: 50,000 (included in Gold plan)
- Copy product ID → `DODO_PRODUCT_DM_OVERAGE_GOLD`

**Platinum:** No overage product needed (unlimited DMs)

## Step 3: Create Top-Up Pack Products

Create 3 one-time products:
- 200 DMs pack → `DODO_PRODUCT_TOPUP_200`
- 500 DMs pack → `DODO_PRODUCT_TOPUP_500`
- 1000 DMs pack → `DODO_PRODUCT_TOPUP_1000`

## Step 4: Link to Subscription (Mixed Checkout)

When creating checkout sessions, include both the subscription product AND the overage product. Dodo supports combining subscription + usage products in a single checkout.

## Step 5: Environment Variables

```
DODO_METER_DM_SENT=meter_xxx
DODO_PRODUCT_DM_OVERAGE_SILVER=prod_overage_silver_xxx
DODO_PRODUCT_DM_OVERAGE_GOLD=prod_overage_gold_xxx
DODO_PRODUCT_TOPUP_200=prod_topup_200_xxx
DODO_PRODUCT_TOPUP_500=prod_topup_500_xxx
DODO_PRODUCT_TOPUP_1000=prod_topup_1000_xxx
```

## Step 6: Uncomment Code

Files with usage billing code:
1. `src/lib/billing/reportDmUsage.js` — Remove stub, uncomment implementation
2. `src/lib/billing/checkDmQuota.js` — Remove stub, uncomment implementation
3. `src/app/dashboard/billing-actions.js` — Uncomment `purchaseTopUp` and checkout updates
4. `src/app/api/webhook/route.js` — Uncomment `reportDmUsage` calls after DM sends

## How It Works

1. User sends DMs through Engagr automation
2. Each DM send fires `reportDmUsage()` to Dodo's event ingestion API
3. Dodo counts events per billing cycle against the free threshold
4. At end of cycle, Dodo calculates: (total DMs - free threshold) × price per DM
5. Overage charge appears on the user's next invoice automatically
6. If user is at limit and has no overage billing, DMs are blocked
7. Dashboard shows usage progress bar + warning when approaching limit
