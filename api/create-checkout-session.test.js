const assert = require('node:assert/strict');
const handler = require('./create-checkout-session');

const {
  LAUNCH_PRICE_CENTS,
  PRODUCT_METADATA_VALUE,
  checkoutParams,
  createCheckoutSession,
  sanitizeSource,
} = handler._private;

assert.equal(sanitizeSource('topic-nyc-plumbing'), 'topic-nyc-plumbing');
assert.equal(sanitizeSource('../bad'), 'site');
assert.equal(sanitizeSource(''), 'site');
assert.equal(sanitizeSource('a'.repeat(81)), 'site');

const params = checkoutParams('topic-nyc-plumbing');
assert.equal(params.get('mode'), 'payment');
assert.equal(params.get('success_url'), 'https://nyc-construction-activity-brief.vercel.app/success.html?session_id={CHECKOUT_SESSION_ID}');
assert.equal(params.get('cancel_url'), 'https://nyc-construction-activity-brief.vercel.app/buy.html?source=topic-nyc-plumbing');
assert.match(params.get('client_reference_id'), /^ncab_topic-nyc-plumbing_[a-z0-9]+$/);
assert.equal(params.get('line_items[0][quantity]'), '1');
assert.equal(params.get('line_items[0][price_data][currency]'), 'usd');
assert.equal(params.get('line_items[0][price_data][unit_amount]'), String(LAUNCH_PRICE_CENTS));
assert.equal(params.get('metadata[product]'), PRODUCT_METADATA_VALUE);
assert.equal(params.get('metadata[source]'), 'topic-nyc-plumbing');
assert.equal(params.get('payment_intent_data[metadata][product]'), PRODUCT_METADATA_VALUE);

async function main() {
  const calls = [];
  const session = await createCheckoutSession(
    'buy-page',
    { STRIPE_SECRET_KEY: 'sk_test_value' },
    async (url, init) => {
      calls.push({ url, init });
      return {
        ok: true,
        json: async () => ({
          id: 'cs_test_123',
          url: 'https://checkout.stripe.com/c/pay/cs_test_123',
        }),
      };
    },
  );
  assert.deepEqual(session, {
    id: 'cs_test_123',
    url: 'https://checkout.stripe.com/c/pay/cs_test_123',
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.stripe.com/v1/checkout/sessions');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers.authorization, 'Bearer sk_test_value');
  assert.match(calls[0].init.body, /metadata%5Bproduct%5D=nyc_construction_activity_brief_current_issue/);

  await assert.rejects(
    () => createCheckoutSession('buy-page', {}, async () => {
      throw new Error('should not call fetch');
    }),
    /Missing STRIPE_SECRET_KEY/,
  );

  console.log('checkout session tests passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
