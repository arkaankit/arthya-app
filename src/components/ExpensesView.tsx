import { useState } from "react";
import { ExpenseItem } from "./ExpenseItem";
import { AddExpenseDialog } from "./AddExpenseDialog";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { Plus, ArrowDownCircle, AlertCircle, Info } from "lucide-react";
import { useData } from "../lib/data-context";
import { formatCurrency, convertCurrency } from "../lib/currency";
import { convertToMonthly } from "../lib/frequency";

export function ExpensesView() {
  const { expenses, profile } = useData();
  const baseCurrency = profile?.currency || 'USD';
  const [filter, setFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const categories = Array.from(new Set(expenses.map(e => e.category)));
  
  const filteredExpenses = filter === 'all' 
    ? expenses 
    : expenses.filter(e => e.category === filter);

  // Convert all expenses to base currency and monthly
  const totalExpenses = expenses.reduce((sum, expense) => {
    const converted = convertCurrency(expense.amount, expense.currency, baseCurrency);
    const monthly = convertToMonthly(converted, expense.frequency as any);
    return sum + monthly;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="mb-2">Expenses</h2>
          <p className="text-muted-foreground">
            Track and manage all your expenses
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
      </div>
      
      <AddExpenseDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      
      {expenses.length === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No expenses tracked yet. Start adding your regular bills and spending to see insights.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 border-border/50 bg-gradient-to-br from-red-500/10 to-transparent">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground mb-1">Total Monthly Expenses</p>
              <h2 className="text-red-600 dark:text-red-400">
                {formatCurrency(totalExpenses, baseCurrency)}
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-red-500/20">
              <ArrowDownCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {expenses.length} tracked expenses
          </p>
        </Card>
        
        <Card className="p-6 border-border/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground mb-1">Expense Categories</p>
              <h3>{categories.length}</h3>
            </div>
            <div className="p-3 rounded-xl bg-orange-500/10">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Different categories
          </p>
        </Card>
      </div>

      {/* Filter - Mobile Dropdown */}
      <div className="md:hidden">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Expenses</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filter - Desktop Tabs */}
      <Tabs value={filter} className="w-full hidden md:block" onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All Expenses</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Expense List */}
      <div className="space-y-3">
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((expense) => (
            <ExpenseItem 
              key={expense.id}
              id={expense.id}
              name={expense.name}
              amount={expense.amount}
              currency={expense.currency}
              category={expense.category}
              subcategory={expense.subcategory}
              frequency={expense.frequency}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No expenses in this category yet.
          </p>
        )}
      </div>

      {/* Expense Breakdown */}
      {expenses.length > 0 && (
        <Card className="p-6 border-border/50">
          <h3 className="mb-4">Expense Breakdown by Category</h3>
          <div className="space-y-4">
            {categories.map(category => {
              const categoryExpenses = expenses
                .filter(e => e.category === category)
                .reduce((sum, e) => {
                  const converted = convertCurrency(e.amount, e.currency, baseCurrency);
                  const monthly = convertToMonthly(converted, e.frequency as any);
                  return sum + monthly;
                }, 0);
              const percentage = totalExpenses > 0 ? (categoryExpenses / totalExpenses) * 100 : 0;

            const categoryColors: Record<string, string> = {
              Housing: '#F59E0B',
              Transportation: '#FBBF24',
              Family: '#F97316',
              Business: '#10B981',
              Others: '#F59E0B'
            };

            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: categoryColors[category] || categoryColors.Others }}
                    />
                    <span>{category}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {formatCurrency(categoryExpenses, baseCurrency)} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: categoryColors[category] || categoryColors.Others
                    }}
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
