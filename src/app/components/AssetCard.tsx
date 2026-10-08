import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { TrendingUp, TrendingDown, Trash2, Pencil } from "lucide-react";
import { formatCurrency, convertCurrency } from "../lib/currency";
import { convertToMonthly } from "../lib/frequency";
import { useData } from "../lib/data-context";
import { getAssetTypeInfo } from "../lib/asset-types";
import { AssetDialog } from "./AssetDialog";
import { toast } from "sonner@2.0.3";

interface AssetCardProps {
  id: string;
  name: string;
  type: string;
  purchaseValue: number;
  currentValue: number;
  currency: string;
  purchaseDate: string;
  color: string;
}

export function AssetCard({
  id,
  name,
  type,
  purchaseValue,
  currentValue,
  currency,
  purchaseDate,
  color
}: AssetCardProps) {
  const { incomeStreams, expenses, profile, deleteAsset } = useData();
  const baseCurrency = profile?.currency || 'USD';
  const assetTypeInfo = getAssetTypeInfo(type);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${name}"? This will not delete linked income/expenses.`)) {
      deleteAsset(id);
      toast.success(`Asset "${name}" has been deleted`);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };
  
  // Calculate linked income and expenses (converted to monthly)
  const linkedIncome = incomeStreams
    .filter(i => i.assetId === id)
    .reduce((sum, i) => {
      const converted = convertCurrency(i.amount, i.currency, baseCurrency);
      const monthly = convertToMonthly(converted, i.frequency as any);
      return sum + monthly;
    }, 0);
    
  const linkedExpenses = expenses
    .filter(e => e.assetId === id)
    .reduce((sum, e) => {
      const converted = convertCurrency(e.amount, e.currency, baseCurrency);
      const monthly = convertToMonthly(converted, e.frequency as any);
      return sum + monthly;
    }, 0);
    
  const netIncome = linkedIncome - linkedExpenses;
  
  // Calculate appreciation
  const appreciation = currentValue - purchaseValue;
  const appreciationPercent = (appreciation / purchaseValue) * 100;
  
  const purchaseYear = new Date(purchaseDate).getFullYear();

  return (
    <>
      <AssetDialog open={showEditDialog} onOpenChange={setShowEditDialog} id={id} />
      <Card className="p-6 border-border/50 hover:border-border transition-all cursor-pointer group relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
        style={{ background: `linear-gradient(135deg, ${color} 0%, transparent 100%)` }}
      />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div 
              className="p-2 rounded-lg text-2xl"
              style={{ backgroundColor: `${color}20` }}
            >
              {assetTypeInfo.icon}
            </div>
            <div>
              <h4 className="mb-1">{name}</h4>
              <Badge variant="secondary" className="text-xs">
                {assetTypeInfo.label}
              </Badge>
            </div>
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

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Value</span>
            <span style={{ color }}>{formatCurrency(currentValue, currency)}</span>
          </div>

          {appreciation !== 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Change</span>
              <div className={`flex items-center gap-1 ${appreciation >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {appreciation >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{appreciationPercent >= 0 ? '+' : ''}{appreciationPercent.toFixed(1)}%</span>
              </div>
            </div>
          )}

          {linkedIncome > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Monthly Income</span>
              <span className="text-green-600 dark:text-green-400">
                +{formatCurrency(linkedIncome, baseCurrency)}
              </span>
            </div>
          )}

          {linkedExpenses > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Monthly Expenses</span>
              <span className="text-red-600 dark:text-red-400">
                -{formatCurrency(linkedExpenses, baseCurrency)}
              </span>
            </div>
          )}

          {(linkedIncome > 0 || linkedExpenses > 0) && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm">Net Monthly</span>
                <span className={`${netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {netIncome >= 0 ? '+' : ''}{formatCurrency(netIncome, baseCurrency)}
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 text-xs text-muted-foreground">
            Owned since {purchaseYear}
          </div>
        </div>
      </div>
    </Card>
    </>
  );
}
