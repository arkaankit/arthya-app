import { useState } from "react";
import { AccountCard } from "./AccountCard";
import { AccountDialog } from "./AccountDialog";
import { PrimaryButton } from "./PrimaryButton";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { Plus, Info, Wallet, Building2, TrendingUp } from "lucide-react";
import { useData } from "../lib/data-context";
import { formatCurrency, convertCurrency } from "../lib/currency";

export function AccountsView() {
  const { accounts, profile } = useData();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="page-title mb-2">Accounts</h2>
          <p className="text-muted-foreground">
            Manage your bank and investment accounts
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-border/50 bg-gradient-to-br from-amber-500/10 to-transparent">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground mb-1">Total Net Worth</p>
              <h2 className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {formatCurrency(totalBalance, baseCurrency)}
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 shadow-sm shadow-amber-500/20">
              <Wallet className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Across {accounts.length} accounts
          </p>
        </Card>

        <Card className="p-6 border-border/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground mb-1">Bank Accounts</p>
              <h3>{formatCurrency(totalBankBalance, baseCurrency)}</h3>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10">
              <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {bankAccounts.length} accounts
          </p>
        </Card>

        <Card className="p-6 border-border/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground mb-1">Investments</p>
              <h3>{formatCurrency(totalInvestmentBalance, baseCurrency)}</h3>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
              <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {investmentAccounts.length} accounts
          </p>
        </Card>
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

      {/* Account Distribution */}
      {accounts.length > 0 && (
        <Card className="p-6 border-border/50">
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

      {/* Privacy Mode Info */}
      <Card className="p-6 border-border/50 bg-gradient-to-br from-amber-500/5 to-transparent">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 shadow-sm shadow-amber-500/10 flex-shrink-0">
            <Building2 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="mb-2">Privacy-First Account Management</h4>
            <p className="text-sm text-muted-foreground mb-3">
              All accounts shown are dummy data for simulation purposes. You can add real or 
              simulated accounts to plan your finances without compromising your privacy.
            </p>
            <Button variant="outline" size="sm">
              Learn More
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}