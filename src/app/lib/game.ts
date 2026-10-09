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
}

export const DEFAULT_GAME: GameState = {
  player: null,
  onboarded: false,
  currencyConfirmed: false,
  ledger: [],
  saves: [],
  calm: false,
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

// Cleans a ledger read from storage or a backup: drops unknown or repeated ids and replaces each
// award's XP with the official value, so editing a save file cannot inflate XP.
export function sanitizeLedger(ledger: Award[]): Award[] {
  const seen = new Set<string>();
  const out: Award[] = [];
  for (const a of ledger) {
    const quest = SETUP_QUESTS.find(q => q.id === a.id);
    if (!quest || seen.has(a.id)) continue;
    seen.add(a.id);
    out.push({ id: a.id, xp: quest.xp, at: a.at });
  }
  return out;
}

export function questTitle(id: string): string {
  return SETUP_QUESTS.find(q => q.id === id)?.title ?? id;
}

export function totalXp(ledger: Award[]): number {
  return ledger.reduce((sum, a) => sum + a.xp, 0);
}
