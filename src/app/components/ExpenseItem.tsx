import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowDownCircle, Trash2, Pencil } from "lucide-react";
import { formatCurrency, convertCurrency, getCurrencyFlag } from "../lib/currency";
import { useData } from "../lib/data-context";
import { ExpenseDialog } from "./ExpenseDialog";
import { toast } from "sonner@2.0.3";

interface ExpenseItemProps {
  id: string;
  name: string;
  amount: number;
  currency: string;
  category: string;
  subcategory: string;
  frequency: string;
}

export function ExpenseItem({
  id,
  name,
  amount,
  currency,
  category,
  subcategory,
  frequency
}: ExpenseItemProps) {
  const { profile, deleteExpense } = useData();
  const baseCurrency = profile?.currency || 'USD';
  const showConversion = currency !== baseCurrency;
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteExpense(id);
      toast.success(`Expense "${name}" has been deleted`);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };
  const categoryColors: Record<string, string> = {
    Housing: '#F59E0B',
    Transportation: '#FBBF24',
    Family: '#F97316',
    Business: '#10B981',
    Others: '#F59E0B'
  };

  const color = categoryColors[category] || categoryColors.Others;

  return (
    <>
      <ExpenseDialog open={showEditDialog} onOpenChange={setShowEditDialog} id={id} />
      <Card className="p-5 border-border/50 hover:border-border transition-colors group">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${color}20` }}
          >
            <ArrowDownCircle className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <h4 className="mb-1">{name}</h4>
            <Badge variant="outline" className="text-xs" style={{ borderColor: color, color }}>
              {category}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-sm">{getCurrencyFlag(currency)}</span>
              <p className="text-red-600 dark:text-red-400">
                -{formatCurrency(amount, currency)}
              </p>
            </div>
            {showConversion && (
              <p className="text-xs text-muted-foreground">
                ≈ {formatCurrency(convertCurrency(amount, currency, baseCurrency), baseCurrency)}
              </p>
            )}
            <p className="text-xs text-muted-foreground capitalize">{frequency}</p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
    </>
  );
}
