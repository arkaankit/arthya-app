import { useState } from "react";
import { HelpTip } from "./GuideView";
import { AccountCard } from "./AccountCard";
import { AccountDialog } from "./AccountDialog";
import { UnlinkedItems } from "./UnlinkedItems";
import { PrimaryButton } from "./PrimaryButton";
import { Card } from "./ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { Plus, Info } from "lucide-react";
import { useData } from "../lib/data-context";
import { formatCurrency, convertCurrency } from "../lib/currency";
import { plural } from "../lib/constants";
import { convertToMonthly, type Frequency } from "../lib/frequency";

export function AccountsView() {
  const { accounts, incomeStreams, expenses, profile } = useData();
  const baseCurrency = profile?.currency || 'USD';
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  
  const bankAccounts = accounts.filter(a => a.type === 'bank');
  const investmentAccounts = accounts.filter(a => a.type === 'investment');
  
  const filteredAccounts = filter === 'all' 
    ? accounts 
    : filter === 'bank' 
    ? bankAccounts 
    : investmentAccounts;

  // Convert all balances to base currency
  const totalBankBalance = bankAccounts.reduce((sum, acc) => {
    return sum + convertCurrency(acc.balance, acc.currency, baseCurrency);
  }, 0);
  
  const totalInvestmentBalance = investmentAccounts.reduce((sum, acc) => {
    return sum + convertCurrency(acc.balance, acc.currency, baseCurrency);
  }, 0);
  
  const totalBalance = totalBankBalance + totalInvestmentBalance;

  // Monthly amounts in the home currency: what linked items add to the vaults, and what unlinked expenses miss.
  const monthly = (i: { amount: number; currency: string; frequency: string }) =>
    convertToMonthly(convertCurrency(i.amount, i.currency, baseCurrency), i.frequency as Frequency);
  const linked = (i: { accountId?: string }) => accounts.some(a => a.id === i.accountId);
  const monthlyNet = incomeStreams.filter(linked).reduce((t, i) => t + monthly(i), 0) - expenses.filter(linked).reduce((t, e) => t + monthly(e), 0);
  const lost = expenses.filter(e => !linked(e));
  const lostOut = lost.reduce((t, e) => t + monthly(e), 0);
  const lostCount = lost.length + incomeStreams.filter(i => !linked(i)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-2"><h2 className="page-title">Accounts</h2><HelpTip page="accounts" /></div>
          <p className="text-muted-foreground">
            Your vaults. Income fills them, expenses empty them.
          </p>
        </div>
        <PrimaryButton icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddDialog(true)}>
          Add Account
        </PrimaryButton>
      </div>
      
      <AccountDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      
      {accounts.length === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Create your first account to start tracking your finances.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'In your vaults', value: formatCurrency(totalBalance, baseCurrency), tone: '', note: `${plural(bankAccounts.length, 'bank account')}, ${plural(investmentAccounts.length, 'investment')}` },
          { label: 'Filling up each month', value: `${monthlyNet >= 0 ? '+' : '−'}${formatCurrency(Math.abs(monthlyNet), baseCurrency)}`, tone: monthlyNet >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400', note: 'linked income minus linked expenses' },
          { label: 'Lost coins', value: `${formatCurrency(lostOut, baseCurrency)} / mo`, tone: lostCount > 0 ? 'text-red-600 dark:text-red-400' : '', note: lostCount > 0 ? `${plural(lostCount, 'item')} no vault is counting` : 'Everything is linked' },
        ].map(s => (
          <Card key={s.label} className="p-4 sm:p-5 gap-0 border-border/50">
            <p className="text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">{s.label}</p>
            <p className={`text-xl sm:text-2xl font-extrabold truncate ${s.tone}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.note}</p>
          </Card>
        ))}
      </div>

      {/* Filter - Mobile Dropdown */}
      <div className="md:hidden">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select account type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            <SelectItem value="bank">Bank Accounts</SelectItem>
            <SelectItem value="investment">Investments</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filter - Desktop Tabs */}
      <Tabs value={filter} className="w-full hidden md:block" onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All Accounts</TabsTrigger>
          <TabsTrigger value="bank">Bank Accounts</TabsTrigger>
          <TabsTrigger value="investment">Investments</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Account Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filteredAccounts.map((account) => (
          <AccountCard key={account.id} {...account} />
        ))}
      </div>

      <UnlinkedItems />

      {/* Account Distribution */}
      {accounts.length > 0 && (
        <Card className="p-4 sm:p-6 border-border/50">
          <h3 className="mb-4">Account Distribution</h3>
          <div className="space-y-3">
            {accounts.map(account => {
              const accountBalanceInBase = convertCurrency(account.balance, account.currency, baseCurrency);
              const percentage = totalBalance > 0 ? (accountBalanceInBase / totalBalance) * 100 : 0;
            
            return (
              <div key={account.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: account.color }}
                    />
                    <span>{account.name}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {formatCurrency(account.balance, account.currency)} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: account.color
                    }}
                  />
                </div>
              </div>
            );
            })}
          </div>
        </Card>
      )}

      <Card className="p-4 sm:p-6 gap-2 border-border/50">
        <h4 className="font-extrabold">Why link to a vault?</h4>
        <p className="text-sm text-muted-foreground">
          Each vault then shows its own money in and out, so you can see which account is growing and which is leaking.
          Your accounts stay in this browser and are never sent to a server.
        </p>
      </Card>
    </div>
  );
}