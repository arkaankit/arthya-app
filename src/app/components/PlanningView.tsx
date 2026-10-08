import { useState } from "react";
import { GoalProgressCard } from "./GoalProgressCard";
import { GoalDialog } from "./GoalDialog";
import { PrimaryButton } from "./PrimaryButton";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Alert, AlertDescription } from "./ui/alert";
import { Plus, Target, Calculator, TrendingUp, Info } from "lucide-react";
import { useData } from "../lib/data-context";
import { formatCurrency, convertCurrency } from "../lib/currency";
import { convertToMonthly } from "../lib/frequency";

export function PlanningView() {
  const { goals, incomeStreams, expenses, profile } = useData();
  const baseCurrency = profile?.currency || 'USD';
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(25000);
  const [months, setMonths] = useState(12);

  // Convert all income and expenses to base currency and monthly amounts
  const totalIncome = incomeStreams.reduce((sum, i) => {
    const converted = convertCurrency(i.amount, i.currency, baseCurrency);
    const monthly = convertToMonthly(converted, i.frequency as any);
    return sum + monthly;
  }, 0);
  
  const totalExpenses = expenses.reduce((sum, e) => {
    const converted = convertCurrency(e.amount, e.currency, baseCurrency);
    const monthly = convertToMonthly(converted, e.frequency as any);
    return sum + monthly;
  }, 0);
  
  const monthlySavings = totalIncome - totalExpenses;
  const requiredMonthlySaving = purchaseAmount / months;
  const canAfford = monthlySavings >= requiredMonthlySaving;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="page-title mb-2">Financial Planning</h2>
          <p className="text-muted-foreground">
            Set goals and plan future purchases
          </p>
        </div>
        <PrimaryButton icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddDialog(true)}>
          New Goal
        </PrimaryButton>
      </div>
      
      <GoalDialog open={showAddDialog} onOpenChange={setShowAddDialog} />

      {/* Planning Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-border/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground mb-1">Active Goals</p>
              <h2>{goals.length}</h2>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 shadow-sm shadow-amber-500/10">
              <Target className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Track your progress
          </p>
        </Card>

        <Card className="p-6 border-border/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground mb-1">Monthly Surplus</p>
              <h3 className={monthlySavings >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                {formatCurrency(monthlySavings, baseCurrency)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {monthlySavings >= 0 ? 'Available for goals' : 'Budget deficit'}
          </p>
        </Card>

        <Card className="p-6 border-border/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground mb-1">Total Target</p>
              <h3>{formatCurrency(goals.reduce((sum, g) => sum + g.targetAmount, 0), baseCurrency)}</h3>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 shadow-sm shadow-yellow-500/10">
              <Calculator className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Combined goal amount
          </p>
        </Card>
      </div>
      
      {totalIncome === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Add income and expenses to use the purchase planning simulator and see accurate forecasts.
          </AlertDescription>
        </Alert>
      )}

      {/* Purchase Planning Simulator */}
      <Card className="p-6 border-border/50 bg-gradient-to-br from-amber-500/5 to-transparent">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 shadow-sm shadow-amber-500/10">
            <Calculator className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3>Purchase Planning Simulator</h3>
            <p className="text-sm text-muted-foreground">
              Plan your next big purchase
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Purchase Amount</Label>
              <Input
                type="number"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                How much do you need?
              </p>
            </div>

            <div className="space-y-3">
              <Label>Time Frame (Months)</Label>
              <div className="space-y-3">
                <Slider
                  value={[months]}
                  onValueChange={(val) => setMonths(val[0])}
                  min={1}
                  max={60}
                  step={1}
                  className="w-full"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">1 month</span>
                  <span className="text-lg">{months} months</span>
                  <span className="text-sm text-muted-foreground">60 months</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Required Monthly Saving</p>
                <p className="text-xl">{formatCurrency(requiredMonthlySaving, baseCurrency, { decimals: 0 })}</p>
              </div>

              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Your Monthly Surplus</p>
                <p className="text-xl text-green-600 dark:text-green-400">
                  {formatCurrency(monthlySavings, baseCurrency)}
                </p>
              </div>

              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Affordability</p>
                <p className={`text-xl ${canAfford ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {canAfford ? 'Affordable' : 'Too High'}
                </p>
              </div>
            </div>

            {!canAfford && (
              <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <p className="text-sm">
                  <span className="text-orange-600 dark:text-orange-400">Suggestion:</span> 
                  {' '}To afford this purchase in {months} months, you would need to increase your income by 
                  {formatCurrency(requiredMonthlySaving - monthlySavings, baseCurrency)} per month or reduce expenses.
                </p>
              </div>
            )}

            {canAfford && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  You can comfortably afford this purchase! After saving {formatCurrency(requiredMonthlySaving, baseCurrency)} 
                  per month, you'll still have {formatCurrency(monthlySavings - requiredMonthlySaving, baseCurrency)} remaining.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Active Goals */}
      {goals.length > 0 && (
        <div>
          <h3 className="mb-4">Active Financial Goals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <GoalProgressCard key={goal.id} {...goal} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="p-6 border-border/50">
        <h3 className="mb-4">Quick Planning Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start gap-3 h-auto py-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10">
              <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-left">
              <p className="text-sm">Create Emergency Fund</p>
              <p className="text-xs text-muted-foreground">Recommended: 6 months expenses</p>
            </div>
          </Button>

          <Button variant="outline" className="justify-start gap-3 h-auto py-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
              <Calculator className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-left">
              <p className="text-sm">Retirement Calculator</p>
              <p className="text-xs text-muted-foreground">Plan for your future</p>
            </div>
          </Button>

          <Button variant="outline" className="justify-start gap-3 h-auto py-4">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <p className="text-sm">Investment Planner</p>
              <p className="text-xs text-muted-foreground">Grow your wealth</p>
            </div>
          </Button>

          <Button variant="outline" className="justify-start gap-3 h-auto py-4">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-left">
              <p className="text-sm">Debt Payoff Calculator</p>
              <p className="text-xs text-muted-foreground">Become debt-free faster</p>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
}