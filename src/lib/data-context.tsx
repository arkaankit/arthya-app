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

  // Account operations
  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount = { ...account, id: Date.now().toString() };
    const updated = [...accounts, newAccount];
    setAccounts(updated);
    storage.setAccounts(updated);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    const updated = accounts.map(acc => 
      acc.id === id ? { ...acc, ...updates } : acc
    );
    setAccounts(updated);
    storage.setAccounts(updated);
  };

  const deleteAccount = (id: string) => {
    const updated = accounts.filter(acc => acc.id !== id);
    setAccounts(updated);
    storage.setAccounts(updated);
  };

  // Asset operations
  const addAsset = (asset: Omit<Asset, 'id'>) => {
    const newAsset = { ...asset, id: Date.now().toString() };
    const updated = [...assets, newAsset];
    setAssets(updated);
    storage.setAssets(updated);
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    const updated = assets.map(asset => 
      asset.id === id ? { ...asset, ...updates } : asset
    );
    setAssets(updated);
    storage.setAssets(updated);
  };

  const deleteAsset = (id: string) => {
    const updated = assets.filter(asset => asset.id !== id);
    setAssets(updated);
    storage.setAssets(updated);
  };

  // Income operations
  const addIncome = (income: Omit<IncomeStream, 'id'>) => {
    const newIncome = { ...income, id: Date.now().toString() };
    const updated = [...incomeStreams, newIncome];
    setIncomeStreams(updated);
    storage.setIncome(updated);
  };

  const updateIncome = (id: string, updates: Partial<IncomeStream>) => {
    const updated = incomeStreams.map(inc => 
      inc.id === id ? { ...inc, ...updates } : inc
    );
    setIncomeStreams(updated);
    storage.setIncome(updated);
  };

  const deleteIncome = (id: string) => {
    const updated = incomeStreams.filter(inc => inc.id !== id);
    setIncomeStreams(updated);
    storage.setIncome(updated);
  };

  // Expense operations
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: Date.now().toString() };
    const updated = [...expenses, newExpense];
    setExpenses(updated);
    storage.setExpenses(updated);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    const updated = expenses.map(exp => 
      exp.id === id ? { ...exp, ...updates } : exp
    );
    setExpenses(updated);
    storage.setExpenses(updated);
  };

  const deleteExpense = (id: string) => {
    const updated = expenses.filter(exp => exp.id !== id);
    setExpenses(updated);
    storage.setExpenses(updated);
  };

  // Goal operations
  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal = { ...goal, id: Date.now().toString() };
    const updated = [...goals, newGoal];
    setGoals(updated);
    storage.setGoals(updated);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    const updated = goals.map(g => 
      g.id === id ? { ...g, ...updates } : g
    );
    setGoals(updated);
    storage.setGoals(updated);
  };

  const deleteGoal = (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    storage.setGoals(updated);
  };

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
        addAccount,
        updateAccount,
        deleteAccount,
        assets,
        addAsset,
        updateAsset,
        deleteAsset,
        incomeStreams,
        addIncome,
        updateIncome,
        deleteIncome,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
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
