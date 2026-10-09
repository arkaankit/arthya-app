import { Link2 } from "lucide-react";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useData } from "../lib/data-context";
import { formatCurrency } from "../lib/currency";

// Income and expenses with no account, each with a one-tap way to link it.
export function UnlinkedItems() {
  const { accounts, incomeStreams, expenses, updateIncome, updateExpense, game } = useData();
  const items = [
    ...incomeStreams.filter(i => !i.accountId).map(i => ({ id: i.id, kind: "income" as const, name: i.source, amount: i.amount, currency: i.currency, frequency: i.frequency })),
    ...expenses.filter(e => !e.accountId).map(e => ({ id: e.id, kind: "expense" as const, name: e.name, amount: e.amount, currency: e.currency, frequency: e.frequency })),
  ];
  if (items.length === 0) return null;

  return (
    <Card className="p-6 border-border/50">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-orange-500/10 shrink-0">
          <Link2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="min-w-0">
          <h3>Not linked to an account</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {accounts.length === 0
              ? "Add an account to see where this money comes in and goes out."
              : "Link each item to the account it moves through to see that account's money in and out."}
            {!game.calm && accounts.length > 0 && " Linking everything by month end earns Tidy month (+40 XP)."}
          </p>
        </div>
      </div>

      <div className="mt-4 divide-y divide-border">
        {items.map(item => (
          <div key={`${item.kind}-${item.id}`} className="py-3 flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                <span className={item.kind === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                  {item.kind === "income" ? "Income" : "Expense"}
                </span>
                {" · "}{formatCurrency(item.amount, item.currency)} {item.frequency}
              </p>
            </div>
            {accounts.length > 0 && (
              <Select
                onValueChange={accountId =>
                  item.kind === "income" ? updateIncome(item.id, { accountId }) : updateExpense(item.id, { accountId })
                }
              >
                <SelectTrigger className="w-full sm:w-52" aria-label={`Link ${item.name} to an account`}>
                  <SelectValue placeholder="Link to…" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
