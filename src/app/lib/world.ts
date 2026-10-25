// Where things stand on the World island: an 8x8 grid of tiles, one diagonal lane per kind.

export type NodeKind = 'income' | 'account' | 'expense' | 'asset';

export interface WorldNode { id: string; kind: NodeKind; i: number; j: number; unlinked: boolean }
// A road joins two linked things. `flow` says which way money moves: 'in' fills a vault, 'out' empties it,
// 'asset' ties rent or upkeep to the asset it belongs to (no money moves along it).
export interface Road { from: string; to: string; flow: 'in' | 'out' | 'asset'; item: string }

interface Item { id: string; accountId?: string; assetId?: string }

export const GRID = 8;
export const LANE_MAX = 5; // more than this per kind would crowd the lane; the rest are counted as hidden
const LANE: Record<NodeKind, number> = { income: 1, account: 3, expense: 5, asset: 7 };

// Spread n slots evenly along a lane of GRID tiles.
const spread = (n: number) => Array.from({ length: n }, (_, k) => Math.round(((k + 0.5) * GRID) / n - 0.5));

export function worldLayout(incomes: Item[], accounts: Item[], expenses: Item[], assets: Item[]) {
  const hasAccount = (x: Item) => accounts.some(a => a.id === x.accountId);
  const nodes: WorldNode[] = [];
  const hidden: Record<NodeKind, number> = { income: 0, account: 0, expense: 0, asset: 0 };
  const shown = new Set<string>();

  const lanes: [NodeKind, Item[]][] = [['income', incomes], ['account', accounts], ['expense', expenses], ['asset', assets]];
  for (const [kind, items] of lanes) {
    const visible = items.slice(0, LANE_MAX);
    hidden[kind] = items.length - visible.length;
    const js = spread(visible.length);
    visible.forEach((x, k) => {
      const id = `${kind}:${x.id}`;
      nodes.push({ id, kind, i: LANE[kind], j: js[k], unlinked: (kind === 'income' || kind === 'expense') && !hasAccount(x) });
      shown.add(id);
    });
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
  const unlinked = incomes.filter(x => !hasAccount(x)).length + expenses.filter(x => !hasAccount(x)).length;
  return { nodes, roads, hidden, unlinked };
}

// Screen position of a tile's centre in the 1000x760 scene (isometric: rotated 45deg, squashed 2:1).
export const TILE = 75;
const CX = 500, CY = 390;
export const iso = (u: number, v: number) => ({ x: CX + (u - v) / Math.SQRT2, y: CY + (u + v) / (2 * Math.SQRT2) });
export const tileCentre = (i: number, j: number) => iso((i + 0.5) * TILE - (GRID * TILE) / 2, (j + 0.5) * TILE - (GRID * TILE) / 2);
