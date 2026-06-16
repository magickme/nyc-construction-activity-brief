const { siteBaseUrl } = require('../site-config');

const PRODUCT_METADATA_VALUE = 'nyc_construction_activity_brief_current_issue';
const PRODUCT_NAME = 'NYC Weekly Construction Activity Brief - Current Issue';
const PRODUCT_DESCRIPTION = 'Current issue ZIP with source-linked NYC DOB NOW rows, buyer workbook, priority slices, source registry, QA report, and buyer README.';
const LAUNCH_PRICE_CENTS = 950;

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function sanitizeSource(value) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!/^[a-z0-9._-]{1,80}$/i.test(text)) return 'site';
  return text;
}

function isSyntheticCheckoutSource(source) {
  return source === 'automation-probe';
}

async function readJsonBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (Buffer.byteLength(body) > 2048) {
      const error = new Error('Body too large');
      error.statusCode = 413;
      throw error;
    }
  }
  try {
    return JSON.parse(body || '{}');
  } catch (error) {
    error.statusCode = 400;
    throw error;
  }
}

function checkoutParams(source) {
  const baseUrl = siteBaseUrl();
  const clientReferenceId = ['ncab', source.replace(/[^a-z0-9_-]/gi, '_'), Date.now().toString(36)]
    .join('_')
    .slice(0, 200);
  return new URLSearchParams({
    mode: 'payment',
    success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/buy.html?source=${encodeURIComponent(source)}&checkout=cancelled`,
    client_reference_id: clientReferenceId,
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][unit_amount]': String(LAUNCH_PRICE_CENTS),
    'line_items[0][price_data][product_data][name]': PRODUCT_NAME,
    'line_items[0][price_data][product_data][description]': PRODUCT_DESCRIPTION,
    'metadata[product]': PRODUCT_METADATA_VALUE,
    'metadata[source]': source,
    'metadata[price_cents]': String(LAUNCH_PRICE_CENTS),
    'metadata[checkout_path]': 'first_party_checkout_session',
    'payment_intent_data[metadata][product]': PRODUCT_METADATA_VALUE,
    'payment_intent_data[metadata][source]': source,
    'payment_intent_data[metadata][checkout_path]': 'first_party_checkout_session',
  });
}

async function createCheckoutSession(source, env = process.env, fetchImpl = fetch) {
  const secret = env.STRIPE_SECRET_KEY;
  if (!secret) {
    const error = new Error('Missing STRIPE_SECRET_KEY');
    error.statusCode = 500;
    throw error;
  }

  const response = await fetchImpl('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${secret}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: checkoutParams(source).toString(),
  });

  if (!response.ok) {
    const error = new Error('Unable to create checkout session');
    error.statusCode = 502;
    throw error;
  }

  const session = await response.json();
  if (!session || typeof session.url !== 'string' || !/^https:\/\/checkout\.stripe\.com\//.test(session.url)) {
    const error = new Error('Invalid checkout session response');
    error.statusCode = 502;
    throw error;
  }
  return session;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST');
    return sendJson(res, 405, { error: 'method_not_allowed' });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    return sendJson(res, error.statusCode || 400, { error: 'invalid_request' });
  }

  const source = sanitizeSource(body.source);
  if (isSyntheticCheckoutSource(source)) {
    return sendJson(res, 400, { error: 'synthetic_checkout_blocked' });
  }

  let session;
  try {
    session = await createCheckoutSession(source);
  } catch (error) {
    return sendJson(res, error.statusCode || 500, { error: 'checkout_session_failed' });
  }

  return sendJson(res, 200, {
    id: session.id,
    url: session.url,
  });
};

module.exports._private = {
  PRODUCT_METADATA_VALUE,
  LAUNCH_PRICE_CENTS,
  checkoutParams,
  createCheckoutSession,
  isSyntheticCheckoutSource,
  sanitizeSource,
};
