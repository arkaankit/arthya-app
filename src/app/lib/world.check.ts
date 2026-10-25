// Run: node src/app/lib/world.check.ts
import assert from 'node:assert/strict';
import { worldLayout, LANE_MAX } from './world.ts';

const accounts = [{ id: 'a1' }, { id: 'a2' }];
const incomes = [{ id: 'i1', accountId: 'a1' }, { id: 'i2', accountId: 'a2' }, { id: 'i3', accountId: 'a1', assetId: 's1' }];
const expenses = [{ id: 'e1', accountId: 'a1' }, { id: 'e2' }, { id: 'e3', assetId: 's2' }];
const assets = [{ id: 's1' }, { id: 's2' }];

const w = worldLayout(incomes, accounts, expenses, assets);

// One node per item; the two expenses with no account are flagged, nothing else is.
assert.equal(w.nodes.length, 3 + 2 + 3 + 2);
assert.equal(w.unlinked, 2);
assert.deepEqual(w.nodes.filter(n => n.unlinked).map(n => n.id).sort(), ['expense:e2', 'expense:e3']);

// No two nodes share a tile.
const tiles = w.nodes.map(n => `${n.i},${n.j}`);
assert.equal(new Set(tiles).size, tiles.length);

// Money flows in from income to a vault and out from a vault to an expense; asset roads move no money.
const byFlow = (f: string) => w.roads.filter(r => r.flow === f).map(r => `${r.from}>${r.to}`).sort();
assert.deepEqual(byFlow('in'), ['income:i1>account:a1', 'income:i2>account:a2', 'income:i3>account:a1']);
assert.deepEqual(byFlow('out'), ['account:a1>expense:e1']);
assert.deepEqual(byFlow('asset'), ['asset:s1>income:i3', 'asset:s2>expense:e3']);

// A link to an account that no longer exists counts as unlinked and draws no road.
const gone = worldLayout([{ id: 'x', accountId: 'gone' }], [], [], []);
assert.equal(gone.unlinked, 1);
assert.equal(gone.roads.length, 0);
assert.ok(gone.nodes[0].unlinked);

// Crowded lanes cap at LANE_MAX and report what was left out, without roads to hidden nodes.
const many = Array.from({ length: 8 }, (_, k) => ({ id: `m${k}` }));
const c = worldLayout([{ id: 'i', accountId: 'm7' }], many, [], []);
assert.equal(c.nodes.filter(n => n.kind === 'account').length, LANE_MAX);
assert.equal(c.hidden.account, 8 - LANE_MAX);
assert.equal(c.roads.length, 0);
assert.ok(!c.nodes.find(n => n.id === 'income:i')!.unlinked); // linked to a real account, just an off-island one

console.log('world layout: all checks passed');
