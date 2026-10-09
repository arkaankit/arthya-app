// Game rules (see the Arthya Gamification Study). Pure functions only: no storage, no React.
// XP is never stored; it is always the sum of the ledger, and each award id is given once.

import type { CreatureColorId, CreatureId } from './sprites.ts';

export interface Player {
  creature: CreatureId;
  color: CreatureColorId;
  name: string;
}

export interface Award {
  id: string; // e.g. 'setup.first-income' or 'monthly.review@2026-10'; never awarded twice
  xp: number;
  at: string; // ISO time
}

export interface Badge {
  id: string;
  at: string;
}

export interface SaveRecord {
  at: string;
  file: string;
}

export interface GameState {
  player: Player | null;
  onboarded: boolean;
  currencyConfirmed: boolean;
  ledger: Award[];
  badges: Badge[]; // permanent once earned; give no XP
  saves: SaveRecord[]; // newest first, at most 10 (dates and names only, never the files)
  visits: Record<string, number[]>; // 'YYYY-MM' -> weeks of that month (1-5) the app was opened
  monthCloseChecked: string | null; // last month in which the previous month was judged
  calm: boolean;
  reminderSnoozedUntil: string | null; // ISO time; the dark-crystal reminder stays hidden until then
}

export const DEFAULT_GAME: GameState = {
  player: null,
  onboarded: false,
  currencyConfirmed: false,
  ledger: [],
  badges: [],
  saves: [],
  visits: {},
  monthCloseChecked: null,
  calm: false,
  reminderSnoozedUntil: null,
};

const DAY = 24 * 60 * 60 * 1000;
export const monthOf = (iso: string) => iso.slice(0, 7); // 'YYYY-MM'
export const weekOfMonth = (iso: string) => Math.min(5, Math.floor((Number(iso.slice(8, 10)) - 1) / 7) + 1);

function previousMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
}

// A clock moved backwards (earlier than the newest award) pauses all awards until it catches up.
const clockWentBack = (ledger: Award[], nowIso: string) => ledger.some(a => a.at > nowIso);

// --- Setup quests (one time) -------------------------------------------------------------------

// What the rules look at. Built from the app's data, never from button presses.
export interface GameFacts {
  hasPlayer: boolean;
  currencyConfirmed: boolean;
  incomes: number;
  accounts: number;
  expenses: number;
  linkedItems: number; // incomes + expenses that have an account
  saves: number;
}

export const SETUP_QUESTS: { id: string; title: string; xp: number; done: (f: GameFacts) => boolean }[] = [
  { id: 'setup.home-currency', title: 'Pick a home currency', xp: 20, done: f => f.currencyConfirmed },
  { id: 'setup.player', title: 'Create your player', xp: 20, done: f => f.hasPlayer },
  { id: 'setup.first-income', title: 'Add your first income', xp: 50, done: f => f.incomes >= 1 },
  { id: 'setup.first-account', title: 'Add your first account', xp: 50, done: f => f.accounts >= 1 },
  { id: 'setup.first-expense', title: 'Add your first expense', xp: 30, done: f => f.expenses >= 1 },
  { id: 'setup.three-incomes', title: 'Map 3 income sources', xp: 60, done: f => f.incomes >= 3 },
  { id: 'setup.link-three', title: 'Link 3 items to an account', xp: 30, done: f => f.linkedItems >= 3 },
  { id: 'setup.first-save', title: 'Make your first save', xp: 50, done: f => f.saves >= 1 },
];

// Setup quests that are complete in the data but not yet in the ledger.
export function newSetupAwards(facts: GameFacts, ledger: Award[], now: Date = new Date()): Award[] {
  const awarded = new Set(ledger.map(a => a.id));
  return SETUP_QUESTS
    .filter(q => !awarded.has(q.id) && q.done(facts))
    .map(q => ({ id: q.id, xp: q.xp, at: now.toISOString() }));
}

// --- Monthly quests ----------------------------------------------------------------------------

export const MONTHLY_XP = { save: 40, review: 60, saver: 100, tidy: 40, checkins: 50 } as const;
export const MONTHLY_SAVE_XP = MONTHLY_XP.save;
const MONTHLY = /^monthly\.(save|review|saver|tidy|checkins)@(\d{4}-\d{2})$/;
const MONTHLY_TITLES: Record<keyof typeof MONTHLY_XP, string> = {
  save: 'Monthly save', review: 'Monthly review', saver: 'Saver month', tidy: 'Tidy month', checkins: 'Steady check-ins',
};

const award = (kind: keyof typeof MONTHLY_XP, month: string, nowIso: string): Award =>
  ({ id: `monthly.${kind}@${month}`, xp: MONTHLY_XP[kind], at: nowIso });

// The monthly save award for `now`, or null: one per calendar month; never for the very first save
// (that is the setup quest); the month must be later than the last awarded one.
export function monthlySaveAward(saves: SaveRecord[], ledger: Award[], now: Date = new Date()): Award | null {
  const nowIso = now.toISOString();
  const month = monthOf(nowIso);
  if (clockWentBack(ledger, nowIso)) return null;
  const savesThisMonth = saves.filter(s => monthOf(s.at) === month).length;
  if (savesThisMonth === 0 || saves.length === 1) return null;
  const lastMonth = ledger
    .map(a => MONTHLY.exec(a.id))
    .filter((m): m is RegExpExecArray => m !== null && m[1] === 'save')
    .map(m => m[2])
    .sort()
    .pop();
  if (lastMonth && lastMonth >= month) return null;
  return award('save', month, nowIso);
}

export interface MonthProgress {
  accountReviews: (string | undefined)[]; // each account's last confirmation time
  weeksVisited: number[]; // weeks of this month the app was opened
}

// Awards earned during the month, paid as soon as they happen.
export function monthlyProgressAwards(p: MonthProgress, ledger: Award[], now: Date = new Date()): Award[] {
  const nowIso = now.toISOString();
  if (clockWentBack(ledger, nowIso)) return [];
  const month = monthOf(nowIso);
  const have = new Set(ledger.map(a => a.id));
  const out: Award[] = [];
  const allReviewed = p.accountReviews.length > 0 && p.accountReviews.every(at => at !== undefined && monthOf(at) === month);
  if (allReviewed && !have.has(`monthly.review@${month}`)) out.push(award('review', month, nowIso));
  if (new Set(p.weeksVisited).size >= 3 && !have.has(`monthly.checkins@${month}`)) out.push(award('checkins', month, nowIso));
  return out;
}

export interface MonthClose {
  monthlyIncome: number; // base currency
  monthlyExpenses: number;
  items: number; // incomes + expenses
  unlinked: number; // incomes + expenses without an account
}

// On the first app start of a new month, judge the previous month (Saver month, Tidy month) using
// the data as it stands then. A new player (never checked) starts judging from next month.
export function monthCloseAwards(c: MonthClose, ledger: Award[], lastChecked: string | null, now: Date = new Date()):
  { awards: Award[]; checked: string } {
  const nowIso = now.toISOString();
  const month = monthOf(nowIso);
  if (lastChecked === null) return { awards: [], checked: month };
  if (lastChecked >= month || clockWentBack(ledger, nowIso)) return { awards: [], checked: lastChecked };
  const prev = previousMonth(month);
  const have = new Set(ledger.map(a => a.id));
  const awards: Award[] = [];
  const rate = c.monthlyIncome > 0 ? (c.monthlyIncome - c.monthlyExpenses) / c.monthlyIncome : 0;
  if (rate >= 0.2 && !have.has(`monthly.saver@${prev}`)) awards.push(award('saver', prev, nowIso));
  if (c.items > 0 && c.unlinked === 0 && !have.has(`monthly.tidy@${prev}`)) awards.push(award('tidy', prev, nowIso));
  return { awards, checked: month };
}

// --- Levels and unlocks ------------------------------------------------------------------------

export const LEVEL_TITLES = ['Coin Finder', 'Pocket Planner', 'Steady Saver', 'Multi-Earner', 'Money Navigator', 'Wealth Ranger'];
export const xpForLevel = (n: number) => 50 * n * (n - 1);

export function levelInfo(xp: number): { level: number; title: string; floor: number; next: number } {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return { level, title: LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length) - 1], floor: xpForLevel(level), next: xpForLevel(level + 1) };
}

export type UnlockId = 'hat' | 'scarf' | 'scene' | 'pouch' | 'gold';
export const UNLOCKS: { level: number; id: UnlockId; label: string }[] = [
  { level: 2, id: 'hat', label: 'Hat for your creature' },
  { level: 3, id: 'scarf', label: 'Scarf' },
  { level: 4, id: 'scene', label: 'Cloud scene behind your avatar' },
  { level: 5, id: 'pouch', label: 'Coin pouch' },
  { level: 6, id: 'gold', label: 'Golden outline' },
];

export const unlocksFor = (level: number) => UNLOCKS.filter(u => u.level <= level).map(u => u.id);

// --- Badges ------------------------------------------------------------------------------------

export const BADGES: { id: string; name: string; hint: string }[] = [
  { id: 'first-coin', name: 'First Coin', hint: 'Add your first income' },
  { id: 'many-incomes', name: 'Many Incomes', hint: '3 or more income sources' },
  { id: 'save-keeper', name: 'Save Keeper', hint: 'Save in 3 different months' },
  { id: 'asset-tracker', name: 'Asset Tracker', hint: 'Link income or an expense to an asset' },
  { id: 'steady-saver', name: 'Steady Saver', hint: 'Reach Saver month 3 times' },
  { id: 'globetrotter', name: 'Globetrotter', hint: 'Track money in 2 currencies' },
];

export interface BadgeFacts {
  assetLinked: boolean;
  currencies: number;
}

function saveMonths(ledger: Award[]): Set<string> {
  const months = new Set<string>();
  for (const a of ledger) {
    const m = MONTHLY.exec(a.id);
    if (m && m[1] === 'save') months.add(m[2]);
    if (a.id === 'setup.first-save') months.add(monthOf(a.at));
  }
  return months;
}

// Badge progress as [current, target], for showing "2 of 3".
export function badgeProgress(id: string, ledger: Award[], f: BadgeFacts): [number, number] {
  const has = (q: string) => ledger.some(a => a.id === q);
  switch (id) {
    case 'first-coin': return [has('setup.first-income') ? 1 : 0, 1];
    case 'many-incomes': return [has('setup.three-incomes') ? 1 : 0, 1];
    case 'save-keeper': return [Math.min(saveMonths(ledger).size, 3), 3];
    case 'asset-tracker': return [f.assetLinked ? 1 : 0, 1];
    case 'steady-saver': return [Math.min(ledger.filter(a => a.id.startsWith('monthly.saver@')).length, 3), 3];
    case 'globetrotter': return [Math.min(f.currencies, 2), 2];
    default: return [0, 1];
  }
}

export function newBadges(ledger: Award[], f: BadgeFacts, earned: Badge[], now: Date = new Date()): Badge[] {
  const have = new Set(earned.map(b => b.id));
  return BADGES
    .filter(b => !have.has(b.id))
    .filter(b => { const [cur, target] = badgeProgress(b.id, ledger, f); return cur >= target; })
    .map(b => ({ id: b.id, at: now.toISOString() }));
}

// --- What to show next -------------------------------------------------------------------------

export interface QuestView {
  id: string;
  title: string;
  detail: string;
  xp: number;
  pct: number; // 0-100
}

export interface QuestBoardFacts extends GameFacts {
  reviewedAccounts: number;
  savingsRate: number | null; // percent, null without income
  unlinked: number;
  weeksVisited: number;
}

// Up to 3 quests to work on: unfinished setup quests first, then this month's.
export function activeQuests(f: QuestBoardFacts, ledger: Award[], now: Date = new Date()): QuestView[] {
  const have = new Set(ledger.map(a => a.id));
  const month = monthOf(now.toISOString());
  const pct = (cur: number, target: number) => Math.round(Math.min(cur / target, 1) * 100);
  const setupDetail: Record<string, [string, number]> = {
    'setup.home-currency': ['Replay setup in Settings', 0],
    'setup.player': ['Replay setup in Settings', 0],
    'setup.first-income': ['Add an income source', 0],
    'setup.first-account': ['Add a bank or investment account', 0],
    'setup.first-expense': ['Add a regular expense', 0],
    'setup.three-incomes': [`${Math.min(f.incomes, 3)} of 3 income sources`, pct(f.incomes, 3)],
    'setup.link-three': [`${Math.min(f.linkedItems, 3)} of 3 linked to an account`, pct(f.linkedItems, 3)],
    'setup.first-save': ['Save your game in Save & Load', 0],
  };
  const list: QuestView[] = SETUP_QUESTS
    .filter(q => !have.has(q.id))
    .map(q => ({ id: q.id, title: q.title, xp: q.xp, detail: setupDetail[q.id][0], pct: setupDetail[q.id][1] }));

  if (f.accounts > 0 && !have.has(`monthly.review@${month}`)) {
    list.push({ id: 'monthly.review', title: MONTHLY_TITLES.review, xp: MONTHLY_XP.review,
      detail: `${f.reviewedAccounts} of ${f.accounts} account balances confirmed`, pct: pct(f.reviewedAccounts, f.accounts) });
  }
  if (f.savingsRate !== null) {
    list.push({ id: 'monthly.saver', title: MONTHLY_TITLES.saver, xp: MONTHLY_XP.saver,
      detail: `Saving ${Math.round(f.savingsRate)}% now; 20% or more at month end`, pct: pct(Math.max(f.savingsRate, 0), 20) });
  }
  if (f.incomes + f.expenses > 0) {
    list.push({ id: 'monthly.tidy', title: MONTHLY_TITLES.tidy, xp: MONTHLY_XP.tidy,
      detail: f.unlinked === 0 ? 'Everything linked; judged at month end' : `${f.unlinked} items not linked to an account`,
      pct: pct(f.incomes + f.expenses - f.unlinked, f.incomes + f.expenses) });
  }
  if (!have.has(`monthly.checkins@${month}`)) {
    list.push({ id: 'monthly.checkins', title: MONTHLY_TITLES.checkins, xp: MONTHLY_XP.checkins,
      detail: `Opened in ${Math.min(f.weeksVisited, 3)} of 3 weeks this month`, pct: pct(f.weeksVisited, 3) });
  }
  return list.slice(0, 3);
}

// --- Display and ledger hygiene ----------------------------------------------------------------

export const crystalState = (saves: SaveRecord[], now: Date = new Date()): { state: CrystalState; days: number | null } => {
  if (saves.length === 0) return { state: 'dark', days: null };
  const days = Math.max(0, Math.floor((now.getTime() - Date.parse(saves[0].at)) / DAY));
  return { state: days <= 7 ? 'glowing' : days <= 30 ? 'fading' : 'dark', days };
};
export type CrystalState = 'glowing' | 'fading' | 'dark';

function officialXp(id: string): number | null {
  const m = MONTHLY.exec(id);
  if (m) return MONTHLY_XP[m[1] as keyof typeof MONTHLY_XP];
  return SETUP_QUESTS.find(q => q.id === id)?.xp ?? null;
}

// Cleans a ledger read from storage or a backup: drops unknown or repeated ids and replaces each
// award's XP with the official value, so editing a save file cannot inflate XP.
export function sanitizeLedger(ledger: Award[]): Award[] {
  const seen = new Set<string>();
  const out: Award[] = [];
  for (const a of ledger) {
    const xp = officialXp(a.id);
    if (xp === null || seen.has(a.id)) continue;
    seen.add(a.id);
    out.push({ id: a.id, xp, at: a.at });
  }
  return out;
}

export function questTitle(id: string): string {
  const m = MONTHLY.exec(id);
  if (m) return MONTHLY_TITLES[m[1] as keyof typeof MONTHLY_XP];
  return SETUP_QUESTS.find(q => q.id === id)?.title ?? id;
}

export function totalXp(ledger: Award[]): number {
  return ledger.reduce((sum, a) => sum + a.xp, 0);
}
