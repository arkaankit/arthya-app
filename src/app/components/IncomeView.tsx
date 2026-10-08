import { useState } from "react";
import { IncomeStreamItem } from "./IncomeStreamItem";
import { IncomeDialog } from "./IncomeDialog";
import { PrimaryButton } from "./PrimaryButton";
import { Card } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Plus, TrendingUp, DollarSign, Info } from "lucide-react";
import { useData } from "../lib/data-context";
import { formatCurrency, convertCurrency } from "../lib/currency";
import { convertToMonthly } from "../lib/frequency";

export function IncomeView() {
  const { incomeStreams, profile } = useData();
  const baseCurrency = profile?.currency || 'USD';
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Convert all income to base currency and monthly
  const totalIncome = incomeStreams.reduce((sum, income) => {
    const converted = convertCurrency(income.amount, income.currency, baseCurrency);
    const monthly = convertToMonthly(converted, income.frequency as any);
    return sum + monthly;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="page-title mb-2">Income Sources</h2>
          <p className="text-muted-foreground">
            Manage and track all your income streams
          </p>
        </div>
        <PrimaryButton icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddDialog(true)}>
          Add Income
        </PrimaryButton>
      </div>
      
      <IncomeDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      
      {incomeStreams.length === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You haven't added any income sources yet. Click "Add Income" to track where your money comes from.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 border-border/50 bg-gradient-to-br from-green-500/10 to-transparent">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground mb-1">Total Monthly Income</p>
              <h2 className="text-green-600 dark:text-green-400">
                {formatCurrency(totalIncome, baseCurrency)}
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-green-500/20">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            From {incomeStreams.length} sources
          </p>
        </Card>
        
        <Card className="p-6 border-border/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground mb-1">Income Sources</p>
              <h3>{incomeStreams.length}</h3>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Active income streams
          </p>
        </Card>
      </div>

      {/* Income List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3>All Income Sources</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {incomeStreams.map((stream) => (
            <IncomeStreamItem 
              key={stream.id} 
              id={stream.id}
              source={stream.source}
              amount={stream.amount}
              currency={stream.currency}
              frequency={stream.frequency}
              category={stream.category}
            />
          ))}
        </div>
      </div>

      {/* Income by Category */}
      {incomeStreams.length > 0 && (
        <Card className="p-6 border-border/50">
          <h3 className="mb-4">Income by Category</h3>
          <div className="space-y-3">
            {Array.from(new Set(incomeStreams.map(s => s.category))).map(category => {
              const categoryIncome = incomeStreams
                .filter(s => s.category === category)
                .reduce((sum, s) => {
                  const converted = convertCurrency(s.amount, s.currency, baseCurrency);
                  const monthly = convertToMonthly(converted, s.frequency as any);
                  return sum + monthly;
                }, 0);
              const percentage = totalIncome > 0 ? (categoryIncome / totalIncome) * 100 : 0;

            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{category}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(categoryIncome, baseCurrency)} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}