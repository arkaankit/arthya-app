import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner@2.0.3';
import { storage, Account, Asset, IncomeStream, Expense, Goal, UserProfile } from './storage';
import { DEFAULT_GAME, monthlySaveAward, newSetupAwards, questTitle, totalXp, type GameState, type Player } from './game';

interface DataContextType {
  // Profile
  profile: UserProfile | null;
  updateProfile: (profile: UserProfile) => void;
  
  // Accounts
  accounts: Account[];
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  
  // Assets
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  
  // Income
  incomeStreams: IncomeStream[];
  addIncome: (income: Omit<IncomeStream, 'id'>) => void;
  updateIncome: (id: string, income: Partial<IncomeStream>) => void;
  deleteIncome: (id: string) => void;
  
  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  
  // Game layer
  game: GameState;
  xp: number;
  setPlayer: (player: Player) => void;
  confirmCurrency: () => void;
  finishOnboarding: () => void;
  replayOnboarding: () => void;
  downloadBackup: () => void;
  snoozeSaveReminder: () => void;

  // Utilities
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface Crud<T extends { id: string }> {
  add: (item: Omit<T, 'id'>) => void;
  update: (id: string, updates: Partial<T>) => void;
  remove: (id: string) => void;
}

// Add/update/remove for one list, keeping React state and localStorage in sync.
function crud<T extends { id: string }>(list: T[], setList: (v: T[]) => void, save: (v: T[]) => void): Crud<T> {
  const commit = (updated: T[]) => {
    setList(updated);
    save(updated);
  };
  return {
    add: (item: Omit<T, 'id'>) => commit([...list, { ...item, id: Date.now().toString() } as T]),
    update: (id: string, updates: Partial<T>) =>
      commit(list.map(x => (x.id === id ? { ...x, ...updates } : x))),
    remove: (id: string) => commit(list.filter(x => x.id !== id)),
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  // Read saved data synchronously on first render. Loading it in an effect left the profile
  // null for a moment, and App's startup code then saved a default profile over the real one.
  const [profile, setProfile] = useState<UserProfile | null>(storage.getProfile);
  const [accounts, setAccounts] = useState<Account[]>(storage.getAccounts);
  const [assets, setAssets] = useState<Asset[]>(storage.getAssets);
  const [incomeStreams, setIncomeStreams] = useState<IncomeStream[]>(storage.getIncome);
  const [expenses, setExpenses] = useState<Expense[]>(storage.getExpenses);
  const [goals, setGoals] = useState<Goal[]>(storage.getGoals);
  const [game, setGame] = useState<GameState>(storage.getGame);

  const saveGame = (next: GameState) => {
    setGame(next);
    storage.setGame(next);
  };

  // Award setup quests whenever the data they check changes. Quest ids already in the ledger
  // are never awarded again, so deleting and re-adding an item earns nothing extra.
  useEffect(() => {
    const awards = newSetupAwards({
      hasPlayer: game.player !== null,
      currencyConfirmed: game.currencyConfirmed,
      incomes: incomeStreams.length,
      accounts: accounts.length,
      expenses: expenses.length,
      linkedItems: [...incomeStreams, ...expenses].filter(item => item.accountId).length,
      saves: game.saves.length,
    }, game.ledger);
    const monthly = monthlySaveAward(game.saves, [...game.ledger, ...awards]);
    if (monthly) awards.push(monthly);
    if (awards.length === 0) return;
    saveGame({ ...game, ledger: [...game.ledger, ...awards] });
    if (game.calm) return;
    if (awards.length === 1) {
      toast.success(`Quest complete: ${questTitle(awards[0].id)}`, { description: `+${awards[0].xp} XP` });
    } else {
      toast.success(`${awards.length} quests complete`, { description: `+${totalXp(awards)} XP for what you've already set up` });
    }
  }, [game, accounts.length, incomeStreams, expenses]);

  // Downloads a backup file ("save your game") and remembers its date and name (never the file).
  const downloadBackup = () => {
    const file = `arthya-save-${new Date().toISOString().slice(0, 10)}.json`;
    const url = URL.createObjectURL(new Blob([storage.exportBackup()], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = file;
    link.click();
    URL.revokeObjectURL(url);
    saveGame({ ...game, saves: [{ at: new Date().toISOString(), file }, ...game.saves].slice(0, 10) });
    toast.success('Game saved. Keep the file somewhere safe.');
  };

  // Profile operations
  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    storage.setProfile(newProfile);
  };

  // When something is saved in a currency other than the base one, offer to switch the base.
  // Only asks when the currency is new for that item (adding, or changing it while editing).
  const offerBaseCurrency = (currency: string | undefined, previous?: string) => {
    if (!profile || !currency || currency === profile.currency || currency === previous) return;
    const base = profile.currency;
    toast(`This is in ${currency}, but your base currency is ${base}.`, {
      description: 'All totals are converted into the base currency.',
      duration: 12000,
      action: { label: `Use ${currency}`, onClick: () => {
        updateProfile({ ...profile, currency });
        toast.success(`Base currency changed to ${currency}`);
      } },
      cancel: { label: `Keep ${base}`, onClick: () => {} },
    });
  };

  // Wraps add/update so saving an item can trigger the base-currency prompt.
  const withCurrencyPrompt = <T extends { id: string; currency: string }>(ops: Crud<T>, list: T[]): Crud<T> => ({
    ...ops,
    add: (item: Omit<T, 'id'>) => {
      ops.add(item);
      offerBaseCurrency(item.currency);
    },
    update: (id: string, updates: Partial<T>) => {
      ops.update(id, updates);
      offerBaseCurrency(updates.currency, list.find(x => x.id === id)?.currency);
    },
  });

  const acc = withCurrencyPrompt(crud(accounts, setAccounts, storage.setAccounts), accounts);
  const ast = withCurrencyPrompt(crud(assets, setAssets, storage.setAssets), assets);
  const inc = withCurrencyPrompt(crud(incomeStreams, setIncomeStreams, storage.setIncome), incomeStreams);
  const exp = withCurrencyPrompt(crud(expenses, setExpenses, storage.setExpenses), expenses);
  const goal = crud(goals, setGoals, storage.setGoals);

  // Reset all data
  const resetData = () => {
    storage.clearAll();
    setProfile(null);
    setAccounts([]);
    setAssets([]);
    setIncomeStreams([]);
    setExpenses([]);
    setGoals([]);
    setGame(DEFAULT_GAME);
  };

  return (
    <DataContext.Provider
      value={{
        profile,
        updateProfile,
        accounts,
        addAccount: acc.add,
        updateAccount: acc.update,
        deleteAccount: acc.remove,
        assets,
        addAsset: ast.add,
        updateAsset: ast.update,
        deleteAsset: ast.remove,
        incomeStreams,
        addIncome: inc.add,
        updateIncome: inc.update,
        deleteIncome: inc.remove,
        expenses,
        addExpense: exp.add,
        updateExpense: exp.update,
        deleteExpense: exp.remove,
        goals,
        addGoal: goal.add,
        updateGoal: goal.update,
        deleteGoal: goal.remove,
        game,
        xp: totalXp(game.ledger),
        setPlayer: (player: Player) => saveGame({ ...game, player }),
        confirmCurrency: () => saveGame({ ...game, currencyConfirmed: true }),
        finishOnboarding: () => saveGame({ ...game, onboarded: true }),
        replayOnboarding: () => saveGame({ ...game, onboarded: false }),
        downloadBackup,
        snoozeSaveReminder: () =>
          saveGame({ ...game, reminderSnoozedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }),
        resetData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
