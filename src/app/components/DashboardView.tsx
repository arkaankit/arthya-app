import { useState } from "react";
import { DashboardMetricCard } from "./DashboardMetricCard";
import { AccountCard } from "./AccountCard";
import { GoalProgressCard } from "./GoalProgressCard";
import { AccountDialog } from "./AccountDialog";
import { IncomeDialog } from "./IncomeDialog";
import { ExpenseDialog } from "./ExpenseDialog";
import { PrimaryButton } from "./PrimaryButton";
import { Card } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Plus
} from "lucide-react";
import { useData } from "../lib/data-context";
import { formatCurrency, convertCurrency } from "../lib/currency";
import { convertToMonthly } from "../lib/frequency";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export function DashboardView() {
  const { accounts, incomeStreams, expenses, goals, profile } = useData();
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const baseCurrency = profile?.currency || 'USD';
  
  // Convert all amounts to base currency
  const totalBalance = accounts.reduce((sum, acc) => {
    const converted = convertCurrency(acc.balance, acc.currency, baseCurrency);
    return sum + converted;
  }, 0);
  
  const totalIncome = incomeStreams.reduce((sum, income) => {
    const converted = convertCurrency(income.amount, income.currency, baseCurrency);
    const monthly = convertToMonthly(converted, income.frequency as any);
    return sum + monthly;
  }, 0);
  
  const totalExpenses = expenses.reduce((sum, expense) => {
    const converted = convertCurrency(expense.amount, expense.currency, baseCurrency);
    const monthly = convertToMonthly(converted, expense.frequency as any);
    return sum + monthly;
  }, 0);
  
  const netSavings = totalIncome - totalExpenses;
  
  // Calculate expense categories (converted to base currency and monthly)
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.name === expense.category);
    const convertedAmount = convertCurrency(expense.amount, expense.currency, baseCurrency);
    const monthlyAmount = convertToMonthly(convertedAmount, expense.frequency as any);
    
    if (existing) {
      existing.value += monthlyAmount;
    } else {
      const categoryColors: Record<string, string> = {
        Housing: '#ff5e24',
        Transportation: '#ffa47a',
        Family: '#6c3200',
        Business: '#5c6066',
        Others: '#989ea4'
      };
      acc.push({
        name: expense.category,
        value: monthlyAmount,
        color: categoryColors[expense.category] || '#9CA3AF'
      });
    }
    return acc;
  }, [] as Array<{ name: string; value: number; color: string }>);
  
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // No history is stored, so instead of invented past months this projects forward:
  // today's balance plus the current monthly net savings, for the next 12 months.
  const projection = Array.from({ length: 13 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    return {
      month: i === 0 ? 'Now' : date.toLocaleString('en-US', { month: 'short' }),
      balance: Math.round(totalBalance + netSavings * i),
    };
  });
  
  // Show empty state if no data
  if (accounts.length === 0) {
    return (
      <>
        <AccountDialog open={showAddAccount} onOpenChange={setShowAddAccount} />
        <IncomeDialog open={showAddIncome} onOpenChange={setShowAddIncome} />
        <ExpenseDialog open={showAddExpense} onOpenChange={setShowAddExpense} />
        
        <div className="space-y-6">
          <div>
            <h2 className="page-title mb-2">Dashboard</h2>
            <p className="text-muted-foreground">
              Your complete financial picture at a glance
            </p>
          </div>
          
          <Alert className="border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription>
              <strong>Welcome to Arthya!</strong> Start building your financial overview by adding your first account, income sources, and expenses. Track your wealth, plan for goals, and achieve financial prosperity.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 border-dashed border-2">
              <div className="text-center">
                <Wallet className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <h4 className="mb-2">Add Account</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first bank or investment account
                </p>
                <PrimaryButton onClick={() => setShowAddAccount(true)} icon={<Plus className="w-4 h-4" />}>
                  Add Account
                </PrimaryButton>
              </div>
            </Card>
            
            <Card className="p-6 border-dashed border-2">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <h4 className="mb-2">Add Income</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Track your income sources
                </p>
                <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowAddIncome(true)}>
                  <Plus className="w-4 h-4" />
                  Add Income
                </Button>
              </div>
            </Card>
            
            <Card className="p-6 border-dashed border-2">
              <div className="text-center">
                <TrendingDown className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <h4 className="mb-2">Add Expense</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Track your spending habits
                </p>
                <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowAddExpense(true)}>
                  <Plus className="w-4 h-4" />
                  Add Expense
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="page-title mb-2">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your financial health
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <DashboardMetricCard
          title="Total Balance"
          value={formatCurrency(totalBalance, baseCurrency)}
          change={`Across ${accounts.length} ${accounts.length === 1 ? 'account' : 'accounts'}`}
          icon={Wallet}
          iconColor="#ff5e24"
        />
        <DashboardMetricCard
          title="Monthly Income"
          value={formatCurrency(totalIncome, baseCurrency)}
          change={`From ${incomeStreams.length} ${incomeStreams.length === 1 ? 'source' : 'sources'}`}
          icon={TrendingUp}
          iconColor="#10B981"
        />
        <DashboardMetricCard
          title="Monthly Expenses"
          value={formatCurrency(totalExpenses, baseCurrency)}
          change={`${expenses.length} recurring ${expenses.length === 1 ? 'item' : 'items'}`}
          icon={TrendingDown}
          iconColor="#EF4444"
        />
        <DashboardMetricCard
          title="Net Savings"
          value={formatCurrency(netSavings, baseCurrency)}
          change={totalIncome > 0 ? `${savingsRate.toFixed(1)}% of income saved` : 'Add income to see your rate'}
          changeType={totalIncome === 0 ? 'neutral' : netSavings >= 0 ? 'positive' : 'negative'}
          icon={PiggyBank}
          iconColor="#ffa47a"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2 border-border/50">
          <h3 className="mb-1">Balance Projection</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Next 12 months if your current recurring income and expenses stay the same
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={projection}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="month"
                stroke="var(--muted-foreground)"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <YAxis
                width={72}
                stroke="var(--muted-foreground)"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                tickFormatter={(v: number) => formatCurrency(v, baseCurrency, { decimals: 0 })}
              />
              <Tooltip
                formatter={(v: number) => [formatCurrency(v, baseCurrency), 'Projected balance']}
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#ff5e24"
                strokeWidth={2}
                name="Projected balance"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 border-border/50">
          <h3 className="mb-6">Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expensesByCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {expensesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => formatCurrency(v, baseCurrency)}
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {expensesByCategory.map((category) => (
              <div key={category.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                </div>
                <span className="text-muted-foreground">
                  {formatCurrency(category.value, baseCurrency)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Accounts Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3>Accounts Overview</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.slice(0, 3).map((account) => (
            <AccountCard key={account.id} {...account} />
          ))}
        </div>
      </div>

      {/* Goals Progress */}
      {goals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3>Financial Goals</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {goals.slice(0, 3).map((goal) => (
              <GoalProgressCard key={goal.id} {...goal} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 border-border/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground mb-1">Income Sources</p>
              <h2>{incomeStreams.length}</h2>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10">
              <ArrowUpRight className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Sources</span>
              <span>
                {incomeStreams.length} sources
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Categories</span>
              <span>
                {Array.from(new Set(incomeStreams.map(i => i.category))).length} types
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground mb-1">Active Expenses</p>
              <h2>{expenses.length}</h2>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10">
              <ArrowDownRight className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Expenses</span>
              <span>
                {expenses.length} items
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Categories</span>
              <span>
                {Array.from(new Set(expenses.map(e => e.category))).length} types
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}