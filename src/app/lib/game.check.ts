// Self-check for the game rules. Run with: node src/app/lib/game.check.ts
import assert from 'node:assert/strict';
import { newSetupAwards, sanitizeLedger, totalXp, SETUP_QUESTS, type GameFacts } from './game.ts';

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

console.log('game rules: all checks passed');
