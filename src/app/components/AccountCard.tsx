import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Trash2, Pencil } from "lucide-react";
import { useData } from "../lib/data-context";
import { accountFlows } from "../lib/flows";
import { formatCurrency } from "../lib/currency";
import { monthOf } from "../lib/game";
import { BUILDINGS } from "../lib/sprites";
import { PixelSprite } from "./PixelSprite";
import { AccountDialog } from "./AccountDialog";
import { toast } from "sonner@2.0.3";

interface AccountCardProps {
  id: string;
  name: string;
  balance: number;
  currency: string;
  type: 'bank' | 'investment';
  color: string;
  reviewedAt?: string;
}

const MAX_CHIPS = 4;

// An account as a vault: balance, monthly money in and out, and what is linked to it.
export function AccountCard({ id, name, balance, currency, type, reviewedAt }: AccountCardProps) {
  const { deleteAccount, incomeStreams, expenses, game } = useData();
  const flow = accountFlows([{ id, currency }], incomeStreams, expenses)[id];
  const [showEditDialog, setShowEditDialog] = useState(false);
  const confirmed = !!reviewedAt && monthOf(reviewedAt) === monthOf(new Date().toISOString());
  const biggest = Math.max(flow.in, flow.out, 1);
  const chips = [
    ...incomeStreams.filter(i => i.accountId === id).map(i => ({ key: `i-${i.id}`, label: `${i.source} in`, income: true })),
    ...expenses.filter(e => e.accountId === id).map(e => ({ key: `e-${e.id}`, label: `${e.name} out`, income: false })),
  ];

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteAccount(id);
      toast.success(`Account "${name}" has been deleted`);
    }
  };

  const money = (n: number) => formatCurrency(n, currency, { decimals: 0 });

  return (
    <>
      <AccountDialog open={showEditDialog} onOpenChange={setShowEditDialog} id={id} />
      <Card className="p-4 sm:p-5 gap-0 border-border/50 hover:border-border transition-colors group">
        <div className="flex items-start gap-3">
          <div className="w-14 h-12 shrink-0 rounded-xl bg-secondary flex items-center justify-center">
            <PixelSprite rows={BUILDINGS.account.rows} palette={BUILDINGS.account.palette} size={42} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-muted-foreground">{type === 'bank' ? 'Bank account' : 'Investment'} · {currency}</p>
            <h4 className="font-extrabold line-clamp-2 break-words">{name}</h4>
          </div>
          <div className="flex shrink-0 gap-1 transition-opacity can-hover:opacity-0 can-hover:group-hover:opacity-100 can-hover:group-focus-within:opacity-100">
            <Button variant="ghost" size="sm" onClick={() => setShowEditDialog(true)} className="h-9 w-9 p-0" aria-label={`Edit ${name}`}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} className="h-9 w-9 p-0" aria-label={`Delete ${name}`}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        <p className="mt-3 text-2xl font-extrabold break-words">{formatCurrency(balance, currency)}</p>

        {/* Saving the account (even unchanged) confirms its balance for the Monthly review quest. */}
        {!game.calm && (
          confirmed ? (
            <span className="mt-3 self-start text-[11px] font-extrabold px-2 py-1 rounded-md bg-green-500/10 text-green-700 dark:text-green-400">Balance confirmed this month</span>
          ) : (
            <button
              onClick={() => setShowEditDialog(true)}
              className="mt-3 self-start text-[11px] font-extrabold px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:underline"
            >
              Confirm this month's balance
            </button>
          )
        )}

        {flow.in === 0 && flow.out === 0 ? (
          <p className="mt-4 pt-3 border-t border-border/60 text-sm text-muted-foreground">
            No income or expenses linked yet. Link them so this vault shows what fills and empties it.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {([['In / mo', flow.in, 'bg-green-500', 'text-green-600 dark:text-green-400', '+'], ['Out / mo', flow.out, 'bg-red-500', 'text-red-600 dark:text-red-400', '−']] as const).map(([label, amount, bar, text, sign]) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="w-16 shrink-0 text-xs font-bold text-muted-foreground">{label}</span>
                <span className="flex-1 h-3 rounded-sm bg-secondary overflow-hidden">
                  <span className={`block h-full ${bar}`} style={{ width: `${(amount / biggest) * 100}%` }} />
                </span>
                <span className={`w-24 shrink-0 text-right text-sm font-extrabold truncate ${text}`}>{amount > 0 ? sign : ''}{money(amount)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-border/60 text-sm">
              <span className="font-bold">Net each month</span>
              <span className={`font-extrabold ${flow.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {flow.net >= 0 ? '+' : '−'}{money(Math.abs(flow.net))}
              </span>
            </div>
          </div>
        )}

        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {chips.slice(0, MAX_CHIPS).map(c => (
              <span
                key={c.key}
                className={`max-w-full truncate text-xs font-bold px-2 py-1 rounded-md ${c.income ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-500/10 text-red-700 dark:text-red-400'}`}
              >
                {c.label}
              </span>
            ))}
            {chips.length > MAX_CHIPS && <span className="text-xs font-bold px-2 py-1 text-muted-foreground">+{chips.length - MAX_CHIPS} more</span>}
          </div>
        )}
      </Card>
    </>
  );
}
