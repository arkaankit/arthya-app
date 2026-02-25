// Mock data for the financial planning system

export const mockAccounts = [
  {
    id: '1',
    name: 'Personal Checking',
    type: 'bank',
    balance: 15420.50,
    currency: 'USD',
    color: '#6366F1'
  },
  {
    id: '2',
    name: 'Business Account',
    type: 'bank',
    balance: 42850.25,
    currency: 'USD',
    color: '#8B5CF6'
  },
  {
    id: '3',
    name: 'Savings',
    type: 'bank',
    balance: 28900.00,
    currency: 'USD',
    color: '#06B6D4'
  },
  {
    id: '4',
    name: 'Stock Portfolio',
    type: 'investment',
    balance: 67500.00,
    currency: 'USD',
    color: '#10B981'
  },
  {
    id: '5',
    name: 'Crypto Wallet',
    type: 'investment',
    balance: 12300.00,
    currency: 'USD',
    color: '#F59E0B'
  }
];

export const mockIncomeStreams = [
  {
    id: '1',
    source: 'Salary',
    amount: 8500,
    currency: 'USD',
    frequency: 'monthly',
    accountId: '1',
    category: 'Employment'
  },
  {
    id: '2',
    source: 'House 1 Rental',
    amount: 2200,
    currency: 'USD',
    frequency: 'monthly',
    accountId: '1',
    category: 'Rental'
  },
  {
    id: '3',
    source: 'House 2 Rental',
    amount: 1800,
    currency: 'USD',
    frequency: 'monthly',
    accountId: '1',
    category: 'Rental'
  },
  {
    id: '4',
    source: 'Freelance Projects',
    amount: 3200,
    currency: 'USD',
    frequency: 'monthly',
    accountId: '2',
    category: 'Freelance'
  },
  {
    id: '5',
    source: 'Business Profits',
    amount: 5800,
    currency: 'USD',
    frequency: 'monthly',
    accountId: '2',
    category: 'Business'
  },
  {
    id: '6',
    source: 'Investment Dividends',
    amount: 850,
    currency: 'USD',
    frequency: 'monthly',
    accountId: '4',
    category: 'Investment'
  }
];

export const mockExpenses = [
  // House 1 Expenses
  {
    id: '1',
    name: 'House 1 - Mortgage',
    amount: 1500,
    currency: 'USD',
    category: 'Housing',
    subcategory: 'House 1',
    frequency: 'monthly',
    accountId: '1'
  },
  {
    id: '2',
    name: 'House 1 - Utilities',
    amount: 180,
    currency: 'USD',
    category: 'Housing',
    subcategory: 'House 1',
    frequency: 'monthly',
    accountId: '1'
  },
  {
    id: '3',
    name: 'House 1 - Maintenance',
    amount: 200,
    currency: 'USD',
    category: 'Housing',
    subcategory: 'House 1',
    frequency: 'monthly',
    accountId: '1'
  },
  // House 2 Expenses
  {
    id: '4',
    name: 'House 2 - Property Tax',
    amount: 300,
    currency: 'USD',
    category: 'Housing',
    subcategory: 'House 2',
    frequency: 'monthly',
    accountId: '1'
  },
  {
    id: '5',
    name: 'House 2 - Cleaning Service',
    amount: 120,
    currency: 'USD',
    category: 'Housing',
    subcategory: 'House 2',
    frequency: 'monthly',
    accountId: '1'
  },
  // Car Expenses
  {
    id: '6',
    name: 'Car - Fuel',
    amount: 280,
    currency: 'USD',
    category: 'Transportation',
    subcategory: 'Car',
    frequency: 'monthly',
    accountId: '1'
  },
  {
    id: '7',
    name: 'Car - Insurance',
    amount: 150,
    currency: 'USD',
    category: 'Transportation',
    subcategory: 'Car',
    frequency: 'monthly',
    accountId: '1'
  },
  // Family Expenses
  {
    id: '8',
    name: 'Groceries',
    amount: 800,
    currency: 'USD',
    category: 'Family',
    subcategory: 'Living',
    frequency: 'monthly',
    accountId: '1'
  },
  {
    id: '9',
    name: 'Education',
    amount: 600,
    currency: 'USD',
    category: 'Family',
    subcategory: 'Education',
    frequency: 'monthly',
    accountId: '1'
  },
  {
    id: '10',
    name: 'Healthcare',
    amount: 250,
    currency: 'USD',
    category: 'Family',
    subcategory: 'Health',
    frequency: 'monthly',
    accountId: '1'
  },
  {
    id: '11',
    name: 'Entertainment',
    amount: 400,
    currency: 'USD',
    category: 'Family',
    subcategory: 'Lifestyle',
    frequency: 'monthly',
    accountId: '1'
  },
  // Business Expenses
  {
    id: '12',
    name: 'Software Subscriptions',
    amount: 350,
    currency: 'USD',
    category: 'Business',
    subcategory: 'Tools',
    frequency: 'monthly',
    accountId: '2'
  },
  {
    id: '13',
    name: 'Marketing',
    amount: 800,
    currency: 'USD',
    category: 'Business',
    subcategory: 'Marketing',
    frequency: 'monthly',
    accountId: '2'
  },
  {
    id: '14',
    name: 'Office Supplies',
    amount: 150,
    currency: 'USD',
    category: 'Business',
    subcategory: 'Operations',
    frequency: 'monthly',
    accountId: '2'
  }
];

export const mockGoals = [
  {
    id: '1',
    name: 'Emergency Fund',
    targetAmount: 50000,
    currentAmount: 28900,
    deadline: '2025-12-31',
    accountId: '3',
    priority: 'high'
  },
  {
    id: '2',
    name: 'New Car',
    targetAmount: 45000,
    currentAmount: 12000,
    deadline: '2026-06-30',
    accountId: '1',
    priority: 'medium'
  },
  {
    id: '3',
    name: 'Business Expansion',
    targetAmount: 100000,
    currentAmount: 35000,
    deadline: '2026-12-31',
    accountId: '2',
    priority: 'high'
  },
  {
    id: '4',
    name: 'Vacation',
    targetAmount: 8000,
    currentAmount: 5200,
    deadline: '2025-08-01',
    accountId: '1',
    priority: 'low'
  }
];

export const mockAssets = [
  {
    id: '1',
    name: 'Primary Residence',
    type: 'property',
    value: 450000,
    purchaseDate: '2020-03-15',
    monthlyExpenses: 1880
  },
  {
    id: '2',
    name: 'Rental Property',
    type: 'property',
    value: 320000,
    purchaseDate: '2021-07-20',
    monthlyExpenses: 420,
    monthlyIncome: 2200
  },
  {
    id: '3',
    name: 'Tesla Model 3',
    type: 'vehicle',
    value: 42000,
    purchaseDate: '2023-01-10',
    monthlyExpenses: 430
  }
];

export const monthlyTrends = [
  { month: 'Apr', income: 20150, expenses: 6230, savings: 13920 },
  { month: 'May', income: 22350, expenses: 6580, savings: 15770 },
  { month: 'Jun', income: 21800, expenses: 5890, savings: 15910 },
  { month: 'Jul', income: 23100, expenses: 6320, savings: 16780 },
  { month: 'Aug', income: 22450, expenses: 6750, savings: 15700 },
  { month: 'Sep', income: 24200, expenses: 6180, savings: 18020 },
  { month: 'Oct', income: 22350, expenses: 6430, savings: 15920 }
];

export const expensesByCategory = [
  { name: 'Housing', value: 2300, color: '#6366F1' },
  { name: 'Transportation', value: 430, color: '#8B5CF6' },
  { name: 'Family', value: 2050, color: '#06B6D4' },
  { name: 'Business', value: 1300, color: '#10B981' },
  { name: 'Others', value: 350, color: '#F59E0B' }
];
