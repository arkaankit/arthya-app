import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { TrendingUp, Trash2, Pencil } from "lucide-react";
import { formatCurrency, convertCurrency, getCurrencyFlag } from "../lib/currency";
import { useData } from "../lib/data-context";
import { IncomeDialog } from "./IncomeDialog";
import { toast } from "sonner@2.0.3";

interface IncomeStreamItemProps {
  id: string;
  source: string;
  amount: number;
  currency: string;
  frequency: string;
  category: string;
}

export function IncomeStreamItem({
  id,
  source,
  amount,
  currency,
  frequency,
  category
}: IncomeStreamItemProps) {
  const { profile, deleteIncome } = useData();
  const baseCurrency = profile?.currency || 'USD';
  const showConversion = currency !== baseCurrency;
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${source}"?`)) {
      deleteIncome(id);
      toast.success(`Income "${source}" has been deleted`);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };
  return (
    <>
      <IncomeDialog open={showEditDialog} onOpenChange={setShowEditDialog} id={id} />
      <Card className="p-4 sm:p-5 border-border/50 hover:border-border transition-colors group">
        <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="p-2 sm:p-3 shrink-0 rounded-xl bg-green-500/10">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="min-w-0">
            <h4 className="mb-1 truncate">{source}</h4>
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-sm">{getCurrencyFlag(currency)}</span>
              <p className="text-green-600 dark:text-green-400">
                +{formatCurrency(amount, currency)}
              </p>
            </div>
            {showConversion && (
              <p className="text-xs text-muted-foreground">
                ≈ {formatCurrency(convertCurrency(amount, currency, baseCurrency), baseCurrency)}
              </p>
            )}
            <p className="text-xs text-muted-foreground capitalize">{frequency}</p>
          </div>
          <div className="flex shrink-0 gap-1 transition-opacity can-hover:opacity-0 can-hover:group-hover:opacity-100 can-hover:group-focus-within:opacity-100">
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
