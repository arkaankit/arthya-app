// Self-check for the game rules. Run with: node src/app/lib/game.check.ts
import assert from 'node:assert/strict';
import { crystalState, monthlySaveAward, newSetupAwards, sanitizeLedger, totalXp, SETUP_QUESTS, type GameFacts } from './game.ts';

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

console.log('game rules: all checks passed');
