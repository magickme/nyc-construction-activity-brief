const DEFAULT_PAYMENT_LINK_IDS = [
  'plink_1TgEa1DmKyUECkDHzfi9Cf2o',
  'plink_1TgClADmKyUECkDHS6FKhOXp',
];
const ZIP_NAME = 'nyc-weekly-construction-activity-brief-v0.1.zip';

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function validSessionId(value) {
  return typeof value === 'string' && /^cs_(live|test)_[A-Za-z0-9]+$/.test(value);
}

function allowedPaymentLinkIds() {
  const configured = process.env.ALLOWED_PAYMENT_LINK_IDS;
  if (!configured) return DEFAULT_PAYMENT_LINK_IDS;
  const ids = configured
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return ids.length ? ids : DEFAULT_PAYMENT_LINK_IDS;
}

async function retrieveSession(sessionId) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    const error = new Error('Missing STRIPE_SECRET_KEY');
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    {
      headers: {
        authorization: `Bearer ${secret}`,
      },
    },
  );

  if (!response.ok) {
    const error = new Error('Unable to verify checkout session');
    error.statusCode = response.status === 404 ? 404 : 502;
    throw error;
  }

  return response.json();
}

function authorizedSession(session) {
  return (
    session &&
    session.payment_status === 'paid' &&
    session.status === 'complete' &&
    allowedPaymentLinkIds().includes(session.payment_link)
  );
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('allow', 'GET');
    return sendJson(res, 405, { error: 'method_not_allowed' });
  }

  const sessionId = req.query && req.query.session_id;
  if (!validSessionId(sessionId)) {
    return sendJson(res, 400, { error: 'missing_or_invalid_session_id' });
  }

  let session;
  try {
    session = await retrieveSession(sessionId);
  } catch (error) {
    return sendJson(res, error.statusCode || 500, { error: 'session_verification_failed' });
  }

  if (!authorizedSession(session)) {
    return sendJson(res, 403, { error: 'payment_required' });
  }

  const encodedZip = process.env.PRODUCT_ZIP_B64;
  if (!encodedZip) {
    return sendJson(res, 500, { error: 'download_not_configured' });
  }

  const zip = Buffer.from(encodedZip, 'base64');
  res.statusCode = 200;
  res.setHeader('content-type', 'application/zip');
  res.setHeader('content-disposition', `attachment; filename="${ZIP_NAME}"`);
  res.setHeader('cache-control', 'private, no-store');
  res.end(zip);
};

module.exports._private = {
  authorizedSession,
  allowedPaymentLinkIds,
  validSessionId,
};
