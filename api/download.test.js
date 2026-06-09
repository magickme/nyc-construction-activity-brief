const assert = require('node:assert/strict');
const handler = require('./download');

const { allowedPaymentLinkIds, authorizedSession, validSessionId } = handler._private;

assert.equal(validSessionId('cs_live_a123ABC'), true);
assert.equal(validSessionId('cs_test_a123ABC'), true);
assert.equal(validSessionId('pi_live_a123ABC'), false);
assert.equal(validSessionId(''), false);
assert.equal(validSessionId(undefined), false);

const originalAllowedPaymentLinkIds = process.env.ALLOWED_PAYMENT_LINK_IDS;
delete process.env.ALLOWED_PAYMENT_LINK_IDS;
assert.deepEqual(allowedPaymentLinkIds(), ['plink_1TgClADmKyUECkDHS6FKhOXp']);

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

process.env.ALLOWED_PAYMENT_LINK_IDS = 'plink_future_launch, plink_1TgClADmKyUECkDHS6FKhOXp';
assert.deepEqual(allowedPaymentLinkIds(), ['plink_future_launch', 'plink_1TgClADmKyUECkDHS6FKhOXp']);
assert.equal(
  authorizedSession({
    payment_status: 'paid',
    status: 'complete',
    payment_link: 'plink_future_launch',
  }),
  true,
);

if (originalAllowedPaymentLinkIds === undefined) {
  delete process.env.ALLOWED_PAYMENT_LINK_IDS;
} else {
  process.env.ALLOWED_PAYMENT_LINK_IDS = originalAllowedPaymentLinkIds;
}

console.log('download endpoint tests passed');
