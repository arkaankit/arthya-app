// Where things stand on the World island: an 8x8 grid of tiles, one diagonal lane per kind.
// Income and expenses that no account counts don't get a lane: they wait on a small rock drifting off
// the island until they're dragged onto an account.

export type NodeKind = 'income' | 'account' | 'expense' | 'asset';

// `rock` is the item's slot on the drifting rock; island nodes have none and use the i, j tile.
export interface WorldNode { id: string; kind: NodeKind; i: number; j: number; rock?: number }
// A road joins two linked things. `flow` says which way money moves: 'in' fills an account, 'out' empties it,
// 'asset' ties rent or upkeep to the asset it belongs to (no money moves along it).
export interface Road { from: string; to: string; flow: 'in' | 'out' | 'asset'; item: string }

interface Item { id: string; accountId?: string; assetId?: string }

export const GRID = 8;
export const LANE_MAX = 5; // more than this per kind would crowd the lane; the rest are counted as hidden
export const ROCK_MAX = 4;
const LANE: Record<NodeKind, number> = { income: 1, account: 3, expense: 5, asset: 7 };

// Spread n slots evenly along a lane of GRID tiles.
const spread = (n: number) => Array.from({ length: n }, (_, k) => Math.round(((k + 0.5) * GRID) / n - 0.5));

export function worldLayout(incomes: Item[], accounts: Item[], expenses: Item[], assets: Item[]) {
  const hasAccount = (x: Item) => accounts.some(a => a.id === x.accountId);
  const nodes: WorldNode[] = [];
  const hidden: Record<NodeKind, number> = { income: 0, account: 0, expense: 0, asset: 0 };
  const shown = new Set<string>();

  const loose = [
    ...incomes.filter(x => !hasAccount(x)).map(x => ({ id: `income:${x.id}`, kind: 'income' as const })),
    ...expenses.filter(x => !hasAccount(x)).map(x => ({ id: `expense:${x.id}`, kind: 'expense' as const })),
  ];
  loose.forEach((x, k) => {
    if (k < ROCK_MAX) { nodes.push({ ...x, i: -1, j: -1, rock: k }); shown.add(x.id); }
    else hidden[x.kind]++;
  });

  const lanes: [NodeKind, Item[]][] = [
    ['income', incomes.filter(hasAccount)], ['account', accounts], ['expense', expenses.filter(hasAccount)], ['asset', assets],
  ];
  for (const [kind, items] of lanes) {
    const visible = items.slice(0, LANE_MAX);
    hidden[kind] += items.length - visible.length;
    const js = spread(visible.length);
    visible.forEach((x, k) => { nodes.push({ id: `${kind}:${x.id}`, kind, i: LANE[kind], j: js[k] }); shown.add(`${kind}:${x.id}`); });
  }

  const roads: Road[] = [];
  const road = (from: string, to: string, flow: Road['flow'], item: string) => { if (shown.has(from) && shown.has(to)) roads.push({ from, to, flow, item }); };
  for (const x of incomes) {
    if (hasAccount(x)) road(`income:${x.id}`, `account:${x.accountId}`, 'in', `income:${x.id}`);
    if (x.assetId) road(`asset:${x.assetId}`, `income:${x.id}`, 'asset', `income:${x.id}`);
  }
  for (const x of expenses) {
    if (hasAccount(x)) road(`account:${x.accountId}`, `expense:${x.id}`, 'out', `expense:${x.id}`);
    if (x.assetId) road(`asset:${x.assetId}`, `expense:${x.id}`, 'asset', `expense:${x.id}`);
  }
  return { nodes, roads, hidden, unlinked: loose.length };
}

// Coin size for a road's monthly amount: 7 to 14 scene units, by square root so area tracks money.
export const coinRadius = (amount: number, largest: number) =>
  largest > 0 ? 7 + 7 * Math.sqrt(Math.min(amount / largest, 1)) : 7;

// Screen position of a tile's centre in the 1000x760 scene (isometric: rotated 45deg, squashed 2:1).
export const TILE = 75;
const CX = 500, CY = 390;
export const iso = (u: number, v: number) => ({ x: CX + (u - v) / Math.SQRT2, y: CY + (u + v) / (2 * Math.SQRT2) });
export const tileCentre = (i: number, j: number) => iso((i + 0.5) * TILE - (GRID * TILE) / 2, (j + 0.5) * TILE - (GRID * TILE) / 2);
// Slots on the drifting rock, below the island's lower-left edge.
export const ROCK_SLOTS = [{ x: 150, y: 560 }, { x: 222, y: 586 }, { x: 294, y: 612 }, { x: 366, y: 638 }];
