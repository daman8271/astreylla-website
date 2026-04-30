# Payal / Bhaiya — Augmont Merchant Account Handoff

Two flags need to be confirmed/enabled on Payal's Augmont merchant account before checkout works end-to-end. Both are managed in the **Augmont merchant portal** (Account Settings → API Permissions, or whatever the equivalent label is — Augmont support can also enable on request).

Production app: `https://claude-code-max-shopify-app-production.up.railway.app`
Test storefront: `https://trial-shop-sqxnl71f.myshopify.com`

---

## BLOCKER 1 — `auto_order_enabled` flag (currently OFF)

**Symptom:** `POST /merchant/order/create` returns **403** from Augmont. Our app translates that to HTTP 503 with friendly message "Online checkout is not yet enabled. Please contact the store."

**Action:** Enable `auto_order_enabled` on Payal's Augmont buyer/merchant account (UAT first, then production).

**Without this:** Cart fully works (add / view / remove). Checkout button shows the disabled message and cannot complete. Customer cannot place an order through the storefront widget.

**Once enabled, this gets unblocked:**
- `POST /api/public/order/create` completes end-to-end
- Augmont generates an `invoiceNumber` → stored in our `orders` table
- Admin "Orders" page shows the invoice immediately
- Customer sees confirmation panel with the invoice number in the widget

---

## BLOCKER 2 — `cart_api_enabled` flag (verify it's ON)

**Status:** Believed to be ON based on UAT testing — `POST /merchant/cart/add`, `GET /merchant/cart`, `DELETE /merchant/cart/delete/{id}` all returned 200 in our smoke tests on Apr 30. **Please reconfirm** before going live, especially on the production merchant account (which we have not yet exercised).

**Symptom if OFF:** Cart "Add to Cart" button in the storefront widget would error. The widget surfaces this gracefully with "Cart not available" state on each card.

**Action:** Confirm the flag is ON on **both** the UAT and production Augmont buyer accounts.

**Verify with curl** (after enabling — replace the credential placeholders):
```bash
# Login to get a JWT
TOKEN=$(curl -s -X POST https://api.uatlgd.augmont.com/api/v1/merchant/login \
  -H "Content-Type: application/json" \
  -d '{"username":"<USERNAME>","password":"<PASSWORD>"}' | jq -r '.token // .data.token')

# Try adding a cart line — replace productId with a real UUID from /merchant/products
curl -s -X POST https://api.uatlgd.augmont.com/api/v1/merchant/cart/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cartProducts":[{"productId":"<some-real-uuid>"}]}'
# Expected: 200 with the new cart line. 403 means flag is OFF.
```

---

## How to verify both flags are working

Once both flags are believed to be ON, run the full end-to-end smoke test from any terminal:

```bash
# 1. List diamonds (should always work — does not need either flag)
curl -s "https://claude-code-max-shopify-app-production.up.railway.app/api/public/diamonds?shop=trial-shop-sqxnl71f.myshopify.com&per_page=3"

# 2. Add to cart — requires cart_api_enabled
SID="test-$(date +%s)"
DID="<copy any 'id' value from step 1>"
curl -s -X POST https://claude-code-max-shopify-app-production.up.railway.app/api/public/cart/add \
  -H "Content-Type: application/json" \
  -d "{\"shop\":\"trial-shop-sqxnl71f.myshopify.com\",\"sessionId\":\"$SID\",\"productId\":\"$DID\"}"

# 3. Place order — requires auto_order_enabled
curl -s -X POST https://claude-code-max-shopify-app-production.up.railway.app/api/public/order/create \
  -H "Content-Type: application/json" \
  -d "{\"shop\":\"trial-shop-sqxnl71f.myshopify.com\",\"sessionId\":\"$SID\",\"customerName\":\"Test Buyer\",\"customerEmail\":\"test@test.com\"}"
# Expected: 200 with { "invoiceNumber": "...", ... }
```

If step 2 returns `503` → `cart_api_enabled` is OFF.
If step 3 returns `503` → `auto_order_enabled` is OFF.

Both passing = ready for live merchant testing.

---

**Reference docs:** See `WORK_LOG.md` (Day 2 Sessions 2 + 4) for the full integration history and additional smoke test variants.
