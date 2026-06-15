const assert = require('node:assert/strict');

const {
  buildMauticContactPayload,
  createOrUpdateMauticContact,
  intentTags,
  mauticConfig,
  NYC_BUYER_SEGMENT_ID,
  sourcePathTag,
  slugTagPart,
  validateSampleRequest,
  validEmail,
  _resetForTesting,
} = require('./sample-request')._private;

assert.equal(NYC_BUYER_SEGMENT_ID, 80);
assert.equal(validEmail('buyer@example.com'), true);
assert.equal(validEmail('not-an-email'), false);
assert.equal(slugTagPart('Sidewalk Shed / Supported Scaffold'), 'sidewalk-shed-supported-scaffold');
assert.equal(sourcePathTag('/topics/nyc-plumbing-permit-activity.html?utm_source=test'), 'topics-nyc-plumbing-permit-activity-html');
assert.equal(sourcePathTag('https://evil.example/path'), '');
assert.deepEqual(intentTags({ monitoringGoal: 'I need invoice help before buying.' }), ['wealth:ncab:intent:invoice']);
assert.deepEqual(intentTags({ monitoringGoal: 'Procurement needs a purchase order approval.' }), ['wealth:ncab:intent:procurement']);
assert.deepEqual(intentTags({ monitoringGoal: 'Send invoice after procurement approval.' }), [
  'wealth:ncab:intent:invoice',
  'wealth:ncab:intent:procurement',
]);

const valid = validateSampleRequest({
  email: 'BUYER@example.com',
  work_type_requested: 'Plumbing',
  territory_requested: 'Brooklyn 11201',
  buyer_type: 'supplier',
  monitoring_goal: 'I want a weekly sample for plumbing supply outreach.',
  source_path: '/topics/nyc-plumbing-permit-activity.html?utm_source=test',
  consent: true,
  website: '',
});
assert.equal(valid.ok, true);
assert.equal(valid.value.email, 'buyer@example.com');
assert.equal(valid.value.sourcePath, 'topics-nyc-plumbing-permit-activity-html');
assert.deepEqual(buildMauticContactPayload(valid.value), {
  email: 'buyer@example.com',
  tags: [
    'wealth:nyc-construction-activity-brief',
    'wealth:nyc-construction-activity-brief:sample-request',
    'source:nyc-construction-activity-brief-site',
    'wealth:ncab:buyer:supplier',
    'wealth:ncab:work-type:plumbing',
    'wealth:ncab:territory:brooklyn-11201',
    'wealth:ncab:source-page:topics-nyc-plumbing-permit-activity-html',
  ],
});

const investor = validateSampleRequest({
  email: 'investor@example.com',
  work_type_requested: 'Structural',
  territory_requested: 'Manhattan',
  buyer_type: 'real-estate-investor',
  monitoring_goal: 'I want a weekly public permit screen before manual acquisition research.',
  source_path: '/topics/nyc-real-estate-investor-permit-research.html',
  consent: 'true',
  website: '',
});
assert.equal(investor.ok, true);
assert.deepEqual(buildMauticContactPayload(investor.value), {
  email: 'investor@example.com',
  tags: [
    'wealth:nyc-construction-activity-brief',
    'wealth:nyc-construction-activity-brief:sample-request',
    'source:nyc-construction-activity-brief-site',
    'wealth:ncab:buyer:real-estate-investor',
    'wealth:ncab:work-type:structural',
    'wealth:ncab:territory:manhattan',
    'wealth:ncab:source-page:topics-nyc-real-estate-investor-permit-research-html',
  ],
});

const invalid = validateSampleRequest({
  email: 'bad',
  work_type_requested: '',
  territory_requested: '',
  buyer_type: 'unknown',
  monitoring_goal: '',
  consent: false,
});
assert.equal(invalid.ok, false);
assert.deepEqual(invalid.errors, [
  'email_required',
  'work_type_required',
  'territory_required',
  'buyer_type_required',
  'monitoring_goal_required',
  'consent_required',
]);

const spam = validateSampleRequest({
  email: 'buyer@example.com',
  work_type_requested: 'Plumbing',
  territory_requested: 'Brooklyn',
  buyer_type: 'supplier',
  monitoring_goal: 'Monitor plumbing permits.',
  consent: true,
  website: 'https://spam.example',
});
assert.equal(spam.ok, false);
assert.equal(spam.errors.includes('spam_check_failed'), true);

const procurement = validateSampleRequest({
  email: 'ops@example.com',
  work_type_requested: 'Selected DOB work types',
  territory_requested: 'NYC',
  buyer_type: 'data-buyer',
  monitoring_goal: 'Procurement needs an invoice and PO approval before card checkout.',
  source_path: '/buy.html',
  consent: true,
  website: '',
});
assert.equal(procurement.ok, true);
assert.deepEqual(buildMauticContactPayload(procurement.value), {
  email: 'ops@example.com',
  tags: [
    'wealth:nyc-construction-activity-brief',
    'wealth:nyc-construction-activity-brief:sample-request',
    'source:nyc-construction-activity-brief-site',
    'wealth:ncab:buyer:data-buyer',
    'wealth:ncab:work-type:selected-dob-work-types',
    'wealth:ncab:territory:nyc',
    'wealth:ncab:source-page:buy-html',
    'wealth:ncab:intent:invoice',
    'wealth:ncab:intent:procurement',
  ],
});

assert.deepEqual(
  mauticConfig({
    MAUTIC_BASE_URL: 'https://mautic.example.com/',
    MAUTIC_USER: 'user',
    MAUTIC_PASSWORD: 'password',
    MAUTIC_OAUTH_CLIENT_ID: 'client',
    MAUTIC_OAUTH_CLIENT_SECRET: 'secret',
  }),
  {
    baseUrl: 'https://mautic.example.com',
    user: 'user',
    password: 'password',
    clientId: 'client',
    clientSecret: 'secret',
    enabled: true,
  },
);

async function main() {
  _resetForTesting();
  const calls = [];
  const mockFetch = async (url, init) => {
    calls.push({ url, init });
    if (url === 'https://mautic.example.com/oauth/v2/token') {
      return {
        ok: true,
        json: async () => ({ access_token: 'token-value', expires_in: 300 }),
      };
    }
    if (url === 'https://mautic.example.com/api/contacts/new') {
      return {
        ok: true,
        json: async () => ({ contact: { id: 123 } }),
      };
    }
    if (url === 'https://mautic.example.com/api/segments/80/contact/123/add') {
      return {
        ok: true,
        json: async () => ({ success: 1 }),
      };
    }
    throw new Error(`unexpected URL ${url}`);
  };

  const result = await createOrUpdateMauticContact(
    buildMauticContactPayload(valid.value),
    {
      MAUTIC_BASE_URL: 'https://mautic.example.com',
      MAUTIC_USER: 'user',
      MAUTIC_PASSWORD: 'password',
      MAUTIC_OAUTH_CLIENT_ID: 'client',
      MAUTIC_OAUTH_CLIENT_SECRET: 'secret',
    },
    mockFetch,
  );
  assert.deepEqual(result, { contactId: 123, segmentId: 80 });
  assert.equal(calls.length, 3);
  assert.equal(calls[1].init.method, 'POST');
  assert.equal(calls[1].init.headers.authorization, 'Bearer token-value');
  assert.deepEqual(JSON.parse(calls[1].init.body).tags, [
    'wealth:nyc-construction-activity-brief',
    'wealth:nyc-construction-activity-brief:sample-request',
    'source:nyc-construction-activity-brief-site',
    'wealth:ncab:buyer:supplier',
    'wealth:ncab:work-type:plumbing',
    'wealth:ncab:territory:brooklyn-11201',
    'wealth:ncab:source-page:topics-nyc-plumbing-permit-activity-html',
  ]);
  assert.equal(calls[2].url, 'https://mautic.example.com/api/segments/80/contact/123/add');
  assert.equal(calls[2].init.method, 'POST');
  assert.equal(calls[2].init.headers.authorization, 'Bearer token-value');

  console.log('sample request tests passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
