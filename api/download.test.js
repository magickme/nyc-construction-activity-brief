const assert = require('node:assert/strict');
const handler = require('./download');

const { authorizedSession, validSessionId } = handler._private;

assert.equal(validSessionId('cs_live_a123ABC'), true);
assert.equal(validSessionId('cs_test_a123ABC'), true);
assert.equal(validSessionId('pi_live_a123ABC'), false);
assert.equal(validSessionId(''), false);
assert.equal(validSessionId(undefined), false);

assert.equal(
  authorizedSession({
    payment_status: 'paid',
    status: 'complete',
    payment_link: 'plink_1TgClADmKyUECkDHS6FKhOXp',
  }),
  true,
);

assert.equal(
  authorizedSession({
    payment_status: 'unpaid',
    status: 'open',
    payment_link: 'plink_1TgClADmKyUECkDHS6FKhOXp',
  }),
  false,
);

assert.equal(
  authorizedSession({
    payment_status: 'paid',
    status: 'complete',
    payment_link: 'plink_wrong',
  }),
  false,
);

console.log('download endpoint tests passed');
