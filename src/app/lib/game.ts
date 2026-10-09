// Game rules (see the Arthya Gamification Study). Pure functions only: no storage, no React.
// XP is never stored; it is always the sum of the ledger, and each quest id is awarded once.

import type { CreatureColorId, CreatureId } from './sprites.ts';

export interface Player {
  creature: CreatureId;
  color: CreatureColorId;
  name: string;
}

export interface Award {
  id: string; // e.g. 'setup.first-income'; never awarded twice
  xp: number;
  at: string; // ISO time
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
  saves: SaveRecord[]; // newest first, at most 10 (dates and names only, never the files)
  calm: boolean;
  reminderSnoozedUntil: string | null; // ISO time; the dark-crystal reminder stays hidden until then
}

export const DEFAULT_GAME: GameState = {
  player: null,
  onboarded: false,
  currencyConfirmed: false,
  ledger: [],
  saves: [],
  calm: false,
  reminderSnoozedUntil: null,
};

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

// --- Save points -----------------------------------------------------------------------------

export const MONTHLY_SAVE_XP = 40;
const MONTHLY_SAVE = /^monthly\.save@(\d{4}-\d{2})$/;
const DAY = 24 * 60 * 60 * 1000;

const monthOf = (iso: string) => iso.slice(0, 7); // 'YYYY-MM'

// The monthly save award for `now`, or null. Rules (study, Save points and Loophole review):
// one per calendar month; never for the very first save (that is the setup quest); the month must
// be later than the last awarded one; and nothing is awarded while the clock reads earlier than
// the newest award (a clock moved backwards pauses awards until real time catches up).
export function monthlySaveAward(saves: SaveRecord[], ledger: Award[], now: Date = new Date()): Award | null {
  const nowIso = now.toISOString();
  const month = monthOf(nowIso);
  if (ledger.some(a => a.at > nowIso)) return null;
  const savesThisMonth = saves.filter(s => monthOf(s.at) === month).length;
  const isOnlyEverSave = saves.length === 1;
  if (savesThisMonth === 0 || isOnlyEverSave) return null;
  const lastMonth = ledger
    .map(a => MONTHLY_SAVE.exec(a.id)?.[1])
    .filter((m): m is string => !!m)
    .sort()
    .pop();
  if (lastMonth && lastMonth >= month) return null;
  return { id: `monthly.save@${month}`, xp: MONTHLY_SAVE_XP, at: nowIso };
}

export type CrystalState = 'glowing' | 'fading' | 'dark';

// Glowing 0 to 7 days after the last save, fading until day 30, dark after that or if never saved.
export function crystalState(saves: SaveRecord[], now: Date = new Date()): { state: CrystalState; days: number | null } {
  if (saves.length === 0) return { state: 'dark', days: null };
  const days = Math.max(0, Math.floor((now.getTime() - Date.parse(saves[0].at)) / DAY));
  return { state: days <= 7 ? 'glowing' : days <= 30 ? 'fading' : 'dark', days };
}

// --- Ledger hygiene ---------------------------------------------------------------------------

function officialXp(id: string): number | null {
  if (MONTHLY_SAVE.test(id)) return MONTHLY_SAVE_XP;
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
  if (MONTHLY_SAVE.test(id)) return 'Monthly save';
  return SETUP_QUESTS.find(q => q.id === id)?.title ?? id;
}

export function totalXp(ledger: Award[]): number {
  return ledger.reduce((sum, a) => sum + a.xp, 0);
}
