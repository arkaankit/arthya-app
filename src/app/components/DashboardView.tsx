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
import { Wallet, TrendingUp, TrendingDown, Info, Plus } from "lucide-react";
import { useData } from "../lib/data-context";
import { formatCurrency, convertCurrency } from "../lib/currency";
import { convertToMonthly } from "../lib/frequency";
import { plural } from "../lib/constants";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PlayerAvatar } from "./PlayerAvatar";
import { levelInfo } from "../lib/game";
import { BADGE_SPRITES, BUILDINGS } from "../lib/sprites";

export function DashboardView({ onOpenProfile }: { onOpenProfile: () => void }) {
  const { accounts, incomeStreams, expenses, goals, profile, game, xp, quests } = useData();
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
  if (accounts.length === 0 && incomeStreams.length === 0 && expenses.length === 0) {
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
            <Card className="p-4 sm:p-6 border-dashed border-2">
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
            
            <Card className="p-4 sm:p-6 border-dashed border-2">
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
            
            <Card className="p-4 sm:p-6 border-dashed border-2">
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

  const level = levelInfo(xp);
  const levelPct = Math.round(((xp - level.floor) / (level.next - level.floor)) * 100);
  const name = game.player?.name || (profile?.name && profile.name !== 'User' ? profile.name : '');
  const hour = new Date().getHours();
  const greeting = `Good ${hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}${name ? `, ${name}` : ''}`;
  const unlinked = incomeStreams.filter(i => !i.accountId).length + expenses.filter(e => !e.accountId).length;
  const biggest = Math.max(...expensesByCategory.map(c => c.value), 1);

  return (
    <div className="space-y-6">
      <ExpenseDialog open={showAddExpense} onOpenChange={setShowAddExpense} />

      {/* Player header */}
      <div className="flex items-center gap-4">
        {game.player && (
          <div className="w-16 h-16 sm:w-[84px] sm:h-[84px] shrink-0 rounded-xl bg-card border border-border flex items-end justify-center pb-1">
            <PlayerAvatar size={56} className="sm:w-[64px] sm:h-auto" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="page-title">{greeting}</h2>
          {game.calm ? (
            <p className="text-muted-foreground">Overview of your financial health</p>
          ) : (
            <button onClick={onOpenProfile} className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-left">
              <span className="text-[13px] font-bold text-orange-600 dark:text-orange-400">Level {level.level} · {level.title}</span>
              <span className="w-40 h-2 rounded-sm bg-card overflow-hidden" role="img" aria-label={`${xp} XP, ${level.next - xp} to level ${level.level + 1}`}>
                <span className="block h-full bg-orange-500" style={{ width: `${levelPct}%` }} />
              </span>
              <span className="text-xs text-muted-foreground">{xp} XP · {level.next - xp} to level {level.level + 1}</span>
            </button>
          )}
        </div>
      </div>

      {/* HUD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <DashboardMetricCard
          title="In your vaults"
          value={formatCurrency(totalBalance, baseCurrency)}
          change={plural(accounts.length, 'account')}
          sprite={BUILDINGS.account}
        />
        <DashboardMetricCard
          title="Coming in"
          value={`+${formatCurrency(totalIncome, baseCurrency)}`}
          valueClass="text-green-600 dark:text-green-400"
          change={`per month · ${plural(incomeStreams.length, 'source')}`}
          sprite={BUILDINGS.income}
        />
        <DashboardMetricCard
          title="Going out"
          value={`−${formatCurrency(totalExpenses, baseCurrency)}`}
          valueClass="text-red-600 dark:text-red-400"
          change={unlinked > 0 ? `per month · ${unlinked} not linked` : 'per month'}
          sprite={BUILDINGS.expense}
        />
        <DashboardMetricCard
          title="Kept"
          value={totalIncome > 0 ? `${Math.round(savingsRate)}%` : '—'}
          valueClass={netSavings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
          change={totalIncome > 0 ? `${formatCurrency(netSavings, baseCurrency)} a month stays with you` : 'Add income to see this'}
          sprite={BADGE_SPRITES['first-coin']}
        />
      </div>

      {/* This month's quests */}
      {!game.calm && quests.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <h3 className="font-extrabold">This month's quests</h3>
            <button onClick={onOpenProfile} className="text-sm font-bold text-orange-600 dark:text-orange-400 hover:underline">All quests and badges</button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {quests.map(q => (
              <div key={q.id} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
                <div className="flex justify-between gap-2">
                  <span className="text-sm font-extrabold">{q.title}</span>
                  <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400 whitespace-nowrap">+{q.xp} XP</span>
                </div>
                <span className="text-xs text-muted-foreground">{q.detail}</span>
                <span className="h-1.5 rounded-sm bg-secondary overflow-hidden"><span className="block h-full bg-orange-300" style={{ width: `${q.pct}%` }} /></span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Where your coins go: one block per twelfth of the biggest category */}
        <Card className="p-4 sm:p-6 border-border/50">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-extrabold">Where your coins go</h3>
            <span className="text-xs text-muted-foreground">per month</span>
          </div>
          {expensesByCategory.length === 0 ? (
            <div className="h-40 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 text-center px-4">
              <p className="text-sm text-muted-foreground">No expenses yet. Add one to see where your money goes.</p>
              <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowAddExpense(true)}>
                <Plus className="w-4 h-4" />Add expense
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {[...expensesByCategory].sort((a, b) => b.value - a.value).map(c => {
                const filled = Math.max(1, Math.round((c.value / biggest) * 12));
                return (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="w-24 sm:w-32 shrink-0 text-sm font-semibold truncate">{c.name}</span>
                    <span className="flex-1 flex gap-[3px]" role="img" aria-label={`${c.name}: ${formatCurrency(c.value, baseCurrency)}`}>
                      {Array.from({ length: 12 }, (_, i) => (
                        <span key={i} className="flex-1 max-w-[14px] h-3.5 rounded-[2px]" style={{ background: i < filled ? c.color : 'var(--secondary)' }} />
                      ))}
                    </span>
                    <span className="w-20 sm:w-24 shrink-0 text-right text-sm font-bold">{formatCurrency(c.value, baseCurrency, { decimals: 0 })}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-4 sm:p-6 border-border/50">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-extrabold">Vault forecast</h3>
            <span className="text-xs text-muted-foreground">if this month repeats</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={projection}>
              <XAxis dataKey="month" stroke="var(--muted-foreground)" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} tickLine={false} />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: 'var(--secondary)' }}
                formatter={(v: number) => [formatCurrency(v, baseCurrency), 'Projected balance']}
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
              />
              <Bar dataKey="balance" radius={[2, 2, 0, 0]}>
                {projection.map((_, i) => <Cell key={i} fill={i === projection.length - 1 ? '#ff5e24' : '#ffa47a'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatCurrency(totalBalance, baseCurrency, { decimals: 0 })} now → about {formatCurrency(projection[projection.length - 1].balance, baseCurrency, { decimals: 0 })} in 12 months
          </p>
        </Card>
      </div>

      {/* Accounts Overview */}
      {accounts.length > 0 && (
        <div>
          <h3 className="font-extrabold mb-3">Your vaults</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.slice(0, 3).map((account) => (
              <AccountCard key={account.id} {...account} />
            ))}
          </div>
        </div>
      )}

      {/* Goals Progress */}
      {goals.length > 0 && (
        <div>
          <h3 className="font-extrabold mb-3">Financial Goals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {goals.slice(0, 3).map((goal) => (
              <GoalProgressCard key={goal.id} {...goal} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
