// Run: node src/app/lib/world.check.ts
import assert from 'node:assert/strict';
import { worldLayout, coinRadius, LANE_MAX, ROCK_MAX } from './world.ts';

const accounts = [{ id: 'a1' }, { id: 'a2' }];
const incomes = [{ id: 'i1', accountId: 'a1' }, { id: 'i2', accountId: 'a2' }, { id: 'i3', accountId: 'a1', assetId: 's1' }];
const expenses = [{ id: 'e1', accountId: 'a1' }, { id: 'e2' }, { id: 'e3', assetId: 's2' }];
const assets = [{ id: 's1' }, { id: 's2' }];

const w = worldLayout(incomes, accounts, expenses, assets);

// One node per item. The two expenses with no account wait on the rock; everything else is on the island.
assert.equal(w.nodes.length, 3 + 2 + 3 + 2);
assert.equal(w.unlinked, 2);
assert.deepEqual(w.nodes.filter(n => n.rock !== undefined).map(n => `${n.id}@${n.rock}`), ['expense:e2@0', 'expense:e3@1']);

// No two island nodes share a tile.
const tiles = w.nodes.filter(n => n.rock === undefined).map(n => `${n.i},${n.j}`);
assert.equal(new Set(tiles).size, tiles.length);

// Money flows in from income to an account and out from an account to an expense; asset roads move no money.
const byFlow = (f: string) => w.roads.filter(r => r.flow === f).map(r => `${r.from}>${r.to}`).sort();
assert.deepEqual(byFlow('in'), ['income:i1>account:a1', 'income:i2>account:a2', 'income:i3>account:a1']);
assert.deepEqual(byFlow('out'), ['account:a1>expense:e1']);
assert.deepEqual(byFlow('asset'), ['asset:s1>income:i3', 'asset:s2>expense:e3']); // a rock item keeps its asset road

// A link to an account that no longer exists counts as unlinked: on the rock, no money road.
const gone = worldLayout([{ id: 'x', accountId: 'gone' }], [], [], []);
assert.equal(gone.unlinked, 1);
assert.equal(gone.nodes[0].rock, 0);
assert.equal(gone.roads.length, 0);

// The rock holds ROCK_MAX; the rest are counted as hidden under their own kind.
const loose = Array.from({ length: 6 }, (_, k) => ({ id: `l${k}` }));
const r = worldLayout([], [], loose, []);
assert.equal(r.nodes.length, ROCK_MAX);
assert.equal(r.hidden.expense, 6 - ROCK_MAX);
assert.equal(r.unlinked, 6);

// Crowded lanes cap at LANE_MAX and report what was left out, without roads to hidden nodes.
const many = Array.from({ length: 8 }, (_, k) => ({ id: `m${k}` }));
const c = worldLayout([{ id: 'i', accountId: 'm7' }], many, [], []);
assert.equal(c.nodes.filter(n => n.kind === 'account').length, LANE_MAX);
assert.equal(c.hidden.account, 8 - LANE_MAX);
assert.equal(c.roads.length, 0);
assert.equal(c.nodes.find(n => n.id === 'income:i')!.rock, undefined); // linked to a real, just off-island, account

// Coins grow with the amount, by area, and stay within 7..14.
assert.equal(coinRadius(0, 100), 7);
assert.equal(coinRadius(100, 100), 14);
assert.equal(coinRadius(500, 100), 14);
assert.equal(coinRadius(25, 100), 10.5);
assert.equal(coinRadius(5, 0), 7);

console.log('world layout: all checks passed');
