import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Building2, TrendingUp } from "lucide-react";
import { useData } from "../lib/data-context";
import { CURRENCIES, getCurrencySymbol } from "../lib/currency";
import { toast } from "sonner@2.0.3";
import { COLORS } from "../lib/constants";

interface EditAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
}

export function EditAccountDialog({ open, onOpenChange, accountId }: EditAccountDialogProps) {
  const { accounts, updateAccount } = useData();
  const account = accounts.find(a => a.id === accountId);

  const [name, setName] = useState("");
  const [type, setType] = useState<"bank" | "investment">("bank");
  const [balance, setBalance] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [color, setColor] = useState(COLORS[0].value);

  useEffect(() => {
    if (account) {
      setName(account.name);
      setType(account.type);
      setBalance(account.balance.toString());
      setCurrency(account.currency);
      setColor(account.color);
    }
  }, [account]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !balance) return;

    updateAccount(accountId, {
      name,
      type,
      balance: parseFloat(balance),
      currency,
      color
    });

    toast.success(`Account "${name}" has been updated`);
    onOpenChange(false);
  };

  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>
            Update your account information
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

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
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
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
