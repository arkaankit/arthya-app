import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { DollarSign, TrendingUp, TrendingDown, ArrowRightLeft, Trash2, Pencil } from "lucide-react";
import { formatCurrency, convertCurrency, getCurrencyFlag } from "../lib/currency";
import { useData } from "../lib/data-context";
import { EditIncomeDialog } from "./EditIncomeDialog";
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
      <EditIncomeDialog open={showEditDialog} onOpenChange={setShowEditDialog} incomeId={id} />
      <Card className="p-5 border-border/50 hover:border-border transition-colors group">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-500/10">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h4 className="mb-1">{source}</h4>
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
