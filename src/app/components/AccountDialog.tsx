import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { PrimaryButton } from "./PrimaryButton";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Building2, TrendingUp } from "lucide-react";
import { useData } from "../lib/data-context";
import { CURRENCIES, getCurrencySymbol } from "../lib/currency";
import { COLORS } from "../lib/constants";
import { toast } from "sonner@2.0.3";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id?: string; // set = edit that account, unset = add a new one
}

export function AccountDialog({ open, onOpenChange, id }: AccountDialogProps) {
  const { accounts, addAccount, updateAccount, profile } = useData();
  const account = accounts.find(a => a.id === id);

  const [name, setName] = useState("");
  const [type, setType] = useState<"bank" | "investment">("bank");
  const [balance, setBalance] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [color, setColor] = useState(COLORS[0].value);

  useEffect(() => {
    if (!open) return;
    setName(account?.name ?? "");
    setType(account?.type ?? "bank");
    setBalance(account?.balance.toString() ?? "");
    setCurrency(account?.currency ?? profile?.currency ?? "USD");
    setColor(account?.color ?? COLORS[0].value);
  }, [open, account]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !balance) return;

    const data = { name, type, balance: parseFloat(balance), currency, color };
    if (id) updateAccount(id, data);
    else addAccount(data);

    toast.success(`Account "${name}" has been ${id ? "updated" : "added"}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{id ? "Edit Account" : "Add New Account"}</DialogTitle>
          <DialogDescription>
            {id ? "Update your account information" : "Create a new bank account or investment account"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              placeholder="e.g., Personal Checking"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2"
              required
            />
          </div>

          <div>
            <Label>Account Type</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                type="button"
                onClick={() => setType('bank')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  type === 'bank'
                    ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/20 shadow-sm shadow-amber-500/20'
                    : 'border-border hover:border-amber-300'
                }`}
              >
                <Building2 className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                <p className="text-sm">Bank</p>
              </button>
              <button
                type="button"
                onClick={() => setType('investment')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  type === 'investment'
                    ? 'border-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 shadow-sm shadow-yellow-500/20'
                    : 'border-border hover:border-yellow-300'
                }`}
              >
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                <p className="text-sm">Investment</p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Label htmlFor="balance">Current Balance</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {getCurrencySymbol(currency)}
                </span>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      <div className="flex items-center gap-2">
                        <span>{curr.flag}</span>
                        <span>{curr.code}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="color">Color Tag</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLORS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.value }} />
                      {c.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <PrimaryButton type="submit">{id ? "Save Changes" : "Add Account"}</PrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
