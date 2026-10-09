// Self-check for per-account flows. Run with: node src/app/lib/flows.check.ts
import assert from 'node:assert/strict';
import { accountFlows } from './flows.ts';

const accounts = [{ id: 'a', currency: 'USD' }, { id: 'b', currency: 'USD' }];
const flows = accountFlows(
  accounts,
  [
    { amount: 3000, currency: 'USD', frequency: 'monthly', accountId: 'a' },
    { amount: 1200, currency: 'USD', frequency: 'yearly', accountId: 'a' }, // 100 a month
    { amount: 999, currency: 'USD', frequency: 'monthly' }, // unlinked: counts nowhere
    { amount: 50, currency: 'USD', frequency: 'monthly', accountId: 'gone' }, // deleted account: counts nowhere
  ],
  [{ amount: 100, currency: 'USD', frequency: 'weekly', accountId: 'a' }], // 100 * 52 / 12
);
assert.equal(Math.round(flows.a.in), 3100);
assert.equal(Math.round(flows.a.out), 433);
assert.equal(Math.round(flows.a.net), 2667);
assert.deepEqual(flows.b, { in: 0, out: 0, net: 0 });

// Other currencies are converted into the account's currency.
const eur = accountFlows([{ id: 'e', currency: 'EUR' }], [{ amount: 100, currency: 'USD', frequency: 'monthly', accountId: 'e' }], []);
assert.equal(Math.round(eur.e.in), 92);

console.log('account flows: all checks passed');
