import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Building2, TrendingUp, Trash2, Pencil } from "lucide-react";
import { useData } from "../lib/data-context";
import { AccountDialog } from "./AccountDialog";
import { toast } from "sonner@2.0.3";

interface AccountCardProps {
  id: string;
  name: string;
  balance: number;
  currency: string;
  type: 'bank' | 'investment';
  color: string;
}

export function AccountCard({ id, name, balance, currency, type, color }: AccountCardProps) {
  const { deleteAccount } = useData();
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteAccount(id);
      toast.success(`Account "${name}" has been deleted`);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };
  return (
    <>
      <AccountDialog open={showEditDialog} onOpenChange={setShowEditDialog} id={id} />
      <Card 
        className="p-6 border-border/50 hover:border-border transition-all cursor-pointer group relative overflow-hidden"
      >
      <div 
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
        style={{ background: `linear-gradient(135deg, ${color} 0%, transparent 100%)` }}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${color}20` }}
            >
              {type === 'bank' ? (
                <Building2 className="w-4 h-4" style={{ color }} />
              ) : (
                <TrendingUp className="w-4 h-4" style={{ color }} />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {type === 'bank' ? 'Bank Account' : 'Investment'}
              </p>
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
        <h4 className="mb-3 text-xl font-semibold">{name}</h4>
        <p className="text-muted-foreground">
          <span className="text-2xl" style={{ color }}>{currency} {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </p>
      </div>
    </Card>
    </>
  );
}
