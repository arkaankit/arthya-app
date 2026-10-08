import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage, Account, Asset, IncomeStream, Expense, Goal, UserProfile } from './storage';

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
  
  // Utilities
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Add/update/remove for one list, keeping React state and localStorage in sync.
function crud<T extends { id: string }>(list: T[], setList: (v: T[]) => void, save: (v: T[]) => void) {
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [incomeStreams, setIncomeStreams] = useState<IncomeStream[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Load data on mount
  useEffect(() => {
    setProfile(storage.getProfile());
    setAccounts(storage.getAccounts());
    setAssets(storage.getAssets());
    setIncomeStreams(storage.getIncome());
    setExpenses(storage.getExpenses());
    setGoals(storage.getGoals());
  }, []);

  // Profile operations
  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    storage.setProfile(newProfile);
  };

  const acc = crud(accounts, setAccounts, storage.setAccounts);
  const ast = crud(assets, setAssets, storage.setAssets);
  const inc = crud(incomeStreams, setIncomeStreams, storage.setIncome);
  const exp = crud(expenses, setExpenses, storage.setExpenses);
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
