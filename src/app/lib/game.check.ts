// Self-check for the game rules. Run with: node src/app/lib/game.check.ts
import assert from 'node:assert/strict';
import {
  badgeProgress, crystalState, levelInfo, monthCloseAwards, monthlyProgressAwards, monthlySaveAward, newBadges,
  newSetupAwards, sanitizeLedger, totalXp, unlocksFor, SETUP_QUESTS, type GameFacts,
} from './game.ts';

const none: GameFacts = { hasPlayer: false, currencyConfirmed: false, incomes: 0, accounts: 0, expenses: 0, linkedItems: 0, saves: 0 };

// Nothing done, nothing awarded.
assert.deepEqual(newSetupAwards(none, []), []);

// First income pays once.
const first = newSetupAwards({ ...none, incomes: 1 }, []);
assert.deepEqual(first.map(a => a.id), ['setup.first-income']);

// Delete and re-add: the ledger already has it, so no second award.
assert.deepEqual(newSetupAwards({ ...none, incomes: 1 }, first), []);
assert.deepEqual(newSetupAwards({ ...none, incomes: 0 }, first), []);

// Item farming: 50 incomes pay the same as 3 (first income + three incomes only).
const farmed = newSetupAwards({ ...none, incomes: 50 }, []);
assert.deepEqual(farmed.map(a => a.id).sort(), ['setup.first-income', 'setup.three-incomes']);

// Everything done once totals 310 XP, and running again awards nothing.
const all: GameFacts = { hasPlayer: true, currencyConfirmed: true, incomes: 3, accounts: 1, expenses: 1, linkedItems: 3, saves: 1 };
const ledger = newSetupAwards(all, []);
assert.equal(ledger.length, SETUP_QUESTS.length);
assert.equal(totalXp(ledger), 310);
assert.deepEqual(newSetupAwards(all, ledger), []);

// Edited save file: inflated XP, a duplicate and a made-up quest are all neutralised.
const tampered = sanitizeLedger([
  { id: 'setup.first-income', xp: 99999, at: 'x' },
  { id: 'setup.first-income', xp: 50, at: 'x' },
  { id: 'setup.free-money', xp: 500, at: 'x' },
]);
assert.equal(totalXp(tampered), 50);

// --- Save points ---
const d = (iso: string) => new Date(iso);
const save = (at: string) => ({ at, file: `arthya-save-${at.slice(0, 10)}.json` });

// The very first save is the setup quest, not a monthly award.
assert.equal(monthlySaveAward([save('2026-10-05T10:00:00Z')], [], d('2026-10-05T10:00:01Z')), null);

// A later save in a later month pays 40 XP once; saving again that month pays nothing.
const saves2 = [save('2026-11-02T10:00:00Z'), save('2026-10-05T10:00:00Z')];
const nov = monthlySaveAward(saves2, [], d('2026-11-02T10:00:01Z'));
assert.equal(nov?.id, 'monthly.save@2026-11');
assert.equal(nov?.xp, 40);
const saves3 = [save('2026-11-20T10:00:00Z'), ...saves2];
assert.equal(monthlySaveAward(saves3, [nov!], d('2026-11-20T10:00:01Z')), null);

// Saving on 30 Sep and 2 Oct earns both months (no "25 days apart" rule hurting honest players).
const sep = monthlySaveAward([save('2026-09-30T10:00:00Z'), save('2026-08-01T10:00:00Z')], [], d('2026-09-30T10:00:01Z'));
assert.equal(sep?.id, 'monthly.save@2026-09');
const oct = monthlySaveAward([save('2026-10-02T10:00:00Z'), save('2026-09-30T10:00:00Z')], [sep!], d('2026-10-02T10:00:01Z'));
assert.equal(oct?.id, 'monthly.save@2026-10');

// Clock moved backwards (to before the newest award): no award until real time catches up.
assert.equal(monthlySaveAward([save('2026-10-01T10:00:00Z'), save('2026-09-01T10:00:00Z')], [nov!], d('2026-10-01T10:00:01Z')), null);

// Crystal: glowing, fading, dark, and dark when never saved.
assert.equal(crystalState([save('2026-10-01T00:00:00Z')], d('2026-10-08T00:00:00Z')).state, 'glowing');
assert.equal(crystalState([save('2026-10-01T00:00:00Z')], d('2026-10-20T00:00:00Z')).state, 'fading');
assert.equal(crystalState([save('2026-10-01T00:00:00Z')], d('2026-11-05T00:00:00Z')).state, 'dark');
assert.equal(crystalState([], d('2026-10-01T00:00:00Z')).state, 'dark');

// Monthly ids survive cleaning with their official XP; a forged XP value does not.
assert.equal(totalXp(sanitizeLedger([{ id: 'monthly.save@2026-10', xp: 9999, at: 'x' }])), 40);

// --- Monthly quests ---
const oct9 = d('2026-10-09T10:00:00Z');

// Monthly review: only when every account was confirmed this month; once per month.
assert.deepEqual(monthlyProgressAwards({ accountReviews: ['2026-10-02T00:00:00Z', '2026-09-30T00:00:00Z'], weeksVisited: [] }, [], oct9), []);
const review = monthlyProgressAwards({ accountReviews: ['2026-10-02T00:00:00Z', '2026-10-05T00:00:00Z'], weeksVisited: [] }, [], oct9);
assert.deepEqual(review.map(a => a.id), ['monthly.review@2026-10']);
assert.deepEqual(monthlyProgressAwards({ accountReviews: ['2026-10-02T00:00:00Z'], weeksVisited: [] }, review, oct9), []);
// No accounts: nothing to review, nothing awarded.
assert.deepEqual(monthlyProgressAwards({ accountReviews: [], weeksVisited: [] }, [], oct9), []);

// Check-ins: 3 different weeks; opening the app 20 times in one week does not count.
assert.deepEqual(monthlyProgressAwards({ accountReviews: [], weeksVisited: [2, 2, 2, 2] }, [], oct9), []);
assert.deepEqual(monthlyProgressAwards({ accountReviews: [], weeksVisited: [1, 2, 4] }, [], oct9).map(a => a.id), ['monthly.checkins@2026-10']);

// Month close: a new player is not judged on a month they did not use.
const goodMonth = { monthlyIncome: 1000, monthlyExpenses: 700, items: 4, unlinked: 0 };
assert.deepEqual(monthCloseAwards(goodMonth, [], null, d('2026-11-01T09:00:00Z')), { awards: [], checked: '2026-11' });
// Next month start judges October: 30% saved and all linked -> Saver + Tidy, once.
const close = monthCloseAwards(goodMonth, [], '2026-10', d('2026-11-01T09:00:00Z'));
assert.deepEqual(close.awards.map(a => a.id), ['monthly.saver@2026-10', 'monthly.tidy@2026-10']);
assert.equal(close.checked, '2026-11');
assert.deepEqual(monthCloseAwards(goodMonth, close.awards, close.checked, d('2026-11-15T09:00:00Z')).awards, []);
// 10% saved and an unlinked item -> nothing.
assert.deepEqual(monthCloseAwards({ monthlyIncome: 1000, monthlyExpenses: 900, items: 4, unlinked: 1 }, [], '2026-10', d('2026-11-01T09:00:00Z')).awards, []);
// January judges December of the previous year.
assert.equal(monthCloseAwards(goodMonth, [], '2026-12', d('2027-01-03T09:00:00Z')).awards[0].id, 'monthly.saver@2026-12');

// --- Levels ---
assert.deepEqual([0, 99, 100, 299, 300, 600, 1000, 1500].map(x => levelInfo(x).level), [1, 1, 2, 2, 3, 4, 5, 6]);
assert.equal(levelInfo(320).title, 'Steady Saver');
assert.deepEqual(unlocksFor(3), ['hat', 'scarf']);

// --- Badges ---
const facts0 = { assetLinked: false, currencies: 1 };
assert.deepEqual(newBadges([], facts0, []), []);
const coin = newBadges([{ id: 'setup.first-income', xp: 50, at: 'x' }], facts0, []);
assert.deepEqual(coin.map(b => b.id), ['first-coin']);
assert.deepEqual(newBadges([{ id: 'setup.first-income', xp: 50, at: 'x' }], facts0, coin), []); // permanent, not repeated
// Save Keeper needs 3 different months (first save counts as one).
const saveLedger = [
  { id: 'setup.first-save', xp: 50, at: '2026-08-02T00:00:00Z' },
  { id: 'monthly.save@2026-09', xp: 40, at: 'x' },
];
assert.deepEqual(badgeProgress('save-keeper', saveLedger, facts0), [2, 3]);
assert.deepEqual(badgeProgress('save-keeper', [...saveLedger, { id: 'monthly.save@2026-10', xp: 40, at: 'x' }], facts0), [3, 3]);

// All monthly kinds keep their official XP when cleaned.
assert.equal(totalXp(sanitizeLedger([
  { id: 'monthly.review@2026-10', xp: 1, at: 'x' }, { id: 'monthly.saver@2026-10', xp: 1, at: 'x' },
  { id: 'monthly.tidy@2026-10', xp: 1, at: 'x' }, { id: 'monthly.checkins@2026-10', xp: 1, at: 'x' },
])), 60 + 100 + 40 + 50);

console.log('game rules: all checks passed');
