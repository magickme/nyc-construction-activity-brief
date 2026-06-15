const MAX_BODY_BYTES = 16 * 1024;
const MAUTIC_TIMEOUT_MS = 5000;
const PRODUCT_TAG = 'wealth:nyc-construction-activity-brief';
const SAMPLE_REQUEST_TAG = 'wealth:nyc-construction-activity-brief:sample-request';
const SITE_SOURCE_TAG = 'source:nyc-construction-activity-brief-site';
const NYC_BUYER_SEGMENT_ID = 80;
const BUYER_TYPES = new Set([
  'construction-support-vendor',
  'specialty-subcontractor',
  'supplier',
  'local-b2b-service-provider',
  'real-estate-investor',
  'broker-developer',
  'permit-expediter',
  'risk-researcher',
  'consultant-analyst',
  'property-manager',
  'data-buyer',
  'other',
]);

let tokenCache = null;

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function sanitizeText(value, maxLength = 180) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function slugTagPart(value) {
  return sanitizeText(value, 80)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function sourcePathTag(value) {
  const text = sanitizeText(value, 180);
  if (!/^\/[A-Za-z0-9._~/?#=&%-]*$/.test(text)) return '';
  return slugTagPart(text.replace(/[?#].*$/, ''));
}

function intentTags(request) {
  const text = `${request.monitoringGoal || ''} ${request.workType || ''}`.toLowerCase();
  const tags = [];
  if (/\binvoice\b/.test(text)) tags.push('wealth:ncab:intent:invoice');
  if (/\bprocurement\b|\bpurchase order\b|\bpo\b|\bapproval\b/.test(text)) {
    tags.push('wealth:ncab:intent:procurement');
  }
  if (/\bfacade\b/.test(text)) tags.push('wealth:ncab:intent:facade');
  if (/\bmasonry\b/.test(text)) tags.push('wealth:ncab:intent:masonry');
  if (/\brestoration\b|\bexterior-repair\b/.test(text)) tags.push('wealth:ncab:intent:restoration');
  if (/\bexterior\b|\bsidewalk shed\b|\bscaffold\b|\bfence\b/.test(text)) {
    tags.push('wealth:ncab:intent:exterior-access');
  }
  return tags;
}

function validEmail(value) {
  return (
    typeof value === 'string' &&
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}

function mauticConfig(env = process.env) {
  const baseUrl = (env.MAUTIC_BASE_URL || '').replace(/\/$/, '');
  const user = env.MAUTIC_USER || '';
  const password = env.MAUTIC_PASSWORD || '';
  const clientId = env.MAUTIC_OAUTH_CLIENT_ID || '';
  const clientSecret = env.MAUTIC_OAUTH_CLIENT_SECRET || '';
  return {
    baseUrl,
    user,
    password,
    clientId,
    clientSecret,
    enabled: Boolean(baseUrl && user && password && clientId && clientSecret),
  };
}

function validateSampleRequest(input) {
  const email = sanitizeText(input.email, 254).toLowerCase();
  const workType = sanitizeText(input.work_type_requested);
  const territory = sanitizeText(input.territory_requested);
  const buyerType = slugTagPart(input.buyer_type);
  const monitoringGoal = sanitizeText(input.monitoring_goal, 360);
  const sourcePath = sourcePathTag(input.source_path);
  const consent = input.consent === true || input.consent === 'true' || input.consent === 'on';
  const website = sanitizeText(input.website, 200);
  const errors = [];

  if (website) errors.push('spam_check_failed');
  if (!validEmail(email)) errors.push('email_required');
  if (!workType) errors.push('work_type_required');
  if (!territory) errors.push('territory_required');
  if (!BUYER_TYPES.has(buyerType)) errors.push('buyer_type_required');
  if (!monitoringGoal) errors.push('monitoring_goal_required');
  if (!consent) errors.push('consent_required');

  return {
    ok: errors.length === 0,
    errors,
    value: {
      email,
      workType,
      territory,
      buyerType,
      monitoringGoal,
      sourcePath,
    },
  };
}

function buildMauticContactPayload(request) {
  const tags = [
    PRODUCT_TAG,
    SAMPLE_REQUEST_TAG,
    SITE_SOURCE_TAG,
    `wealth:ncab:buyer:${request.buyerType}`,
    `wealth:ncab:work-type:${slugTagPart(request.workType)}`,
    `wealth:ncab:territory:${slugTagPart(request.territory)}`,
    request.sourcePath ? `wealth:ncab:source-page:${request.sourcePath}` : '',
    ...intentTags(request),
  ];

  return {
    email: request.email,
    tags: [...new Set(tags.filter((tag) => !tag.endsWith(':')))],
  };
}

async function readJsonBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
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

async function fetchWithTimeout(fetchImpl, url, init, label) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MAUTIC_TIMEOUT_MS);
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal });
  } catch (error) {
    const wrapped = new Error(`${label} failed`);
    wrapped.cause = error;
    throw wrapped;
  } finally {
    clearTimeout(timeout);
  }
}

async function getMauticToken(config, fetchImpl = fetch) {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.accessToken;
  }

  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    username: config.user,
    password: config.password,
  });
  const response = await fetchWithTimeout(
    fetchImpl,
    `${config.baseUrl}/oauth/v2/token`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    },
    'Mautic OAuth',
  );

  if (!response.ok) {
    const error = new Error('Mautic OAuth failed');
    error.statusCode = 502;
    throw error;
  }

  const data = await response.json();
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in || 300) * 1000,
  };
  return tokenCache.accessToken;
}

async function createOrUpdateMauticContact(contact, env = process.env, fetchImpl = fetch) {
  const config = mauticConfig(env);
  if (!config.enabled) {
    const error = new Error('Mautic not configured');
    error.statusCode = 503;
    throw error;
  }

  const token = await getMauticToken(config, fetchImpl);
  const response = await fetchWithTimeout(
    fetchImpl,
    `${config.baseUrl}/api/contacts/new`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(contact),
    },
    'Mautic contact upsert',
  );

  if (!response.ok) {
    const error = new Error('Mautic contact upsert failed');
    error.statusCode = 502;
    throw error;
  }

  const data = await response.json().catch(() => ({}));
  const contactId = data.contact?.id || data.id || null;
  if (!contactId) {
    const error = new Error('Mautic contact id missing');
    error.statusCode = 502;
    throw error;
  }

  const segmentResponse = await fetchWithTimeout(
    fetchImpl,
    `${config.baseUrl}/api/segments/${NYC_BUYER_SEGMENT_ID}/contact/${contactId}/add`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
    'Mautic segment add',
  );

  if (!segmentResponse.ok) {
    const error = new Error('Mautic segment add failed');
    error.statusCode = 502;
    throw error;
  }

  return {
    contactId,
    segmentId: NYC_BUYER_SEGMENT_ID,
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST');
    return sendJson(res, 405, { error: 'method_not_allowed' });
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (error) {
    return sendJson(res, error.statusCode || 400, { error: 'invalid_json' });
  }

  const validation = validateSampleRequest(payload);
  if (!validation.ok) {
    return sendJson(res, 400, { error: 'invalid_request', fields: validation.errors });
  }

  try {
    const result = await createOrUpdateMauticContact(buildMauticContactPayload(validation.value));
    return sendJson(res, 200, {
      ok: true,
      saved: true,
      contact_id_present: Boolean(result.contactId),
      segment_id: result.segmentId,
    });
  } catch (error) {
    return sendJson(res, error.statusCode || 502, { error: 'request_not_saved' });
  }
};

module.exports._private = {
  BUYER_TYPES,
  NYC_BUYER_SEGMENT_ID,
  buildMauticContactPayload,
  createOrUpdateMauticContact,
  intentTags,
  mauticConfig,
  sanitizeText,
  slugTagPart,
  sourcePathTag,
  validEmail,
  validateSampleRequest,
  _resetForTesting() {
    tokenCache = null;
  },
};
