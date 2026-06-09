const assert = require('node:assert/strict');

const {
  buildMauticContactPayload,
  createOrUpdateMauticContact,
  mauticConfig,
  slugTagPart,
  validateSampleRequest,
  validEmail,
  _resetForTesting,
} = require('./sample-request')._private;

assert.equal(validEmail('buyer@example.com'), true);
assert.equal(validEmail('not-an-email'), false);
assert.equal(slugTagPart('Sidewalk Shed / Supported Scaffold'), 'sidewalk-shed-supported-scaffold');

const valid = validateSampleRequest({
  email: 'BUYER@example.com',
  work_type_requested: 'Plumbing',
  territory_requested: 'Brooklyn 11201',
  buyer_type: 'supplier',
  monitoring_goal: 'I want a weekly sample for plumbing supply outreach.',
  consent: true,
  website: '',
});
assert.equal(valid.ok, true);
assert.equal(valid.value.email, 'buyer@example.com');
assert.deepEqual(buildMauticContactPayload(valid.value), {
  email: 'buyer@example.com',
  tags: [
    'wealth:nyc-construction-activity-brief',
    'wealth:nyc-construction-activity-brief:sample-request',
    'source:nyc-construction-activity-brief-site',
    'wealth:ncab:buyer:supplier',
    'wealth:ncab:work-type:plumbing',
    'wealth:ncab:territory:brooklyn-11201',
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
  assert.deepEqual(result, { contactId: 123 });
  assert.equal(calls.length, 2);
  assert.equal(calls[1].init.method, 'POST');
  assert.equal(calls[1].init.headers.authorization, 'Bearer token-value');
  assert.deepEqual(JSON.parse(calls[1].init.body).tags, [
    'wealth:nyc-construction-activity-brief',
    'wealth:nyc-construction-activity-brief:sample-request',
    'source:nyc-construction-activity-brief-site',
    'wealth:ncab:buyer:supplier',
    'wealth:ncab:work-type:plumbing',
    'wealth:ncab:territory:brooklyn-11201',
  ]);

  console.log('sample request tests passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
