import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { PrimaryButton } from "./PrimaryButton";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useData } from "../lib/data-context";
import { CURRENCIES, getCurrencySymbol } from "../lib/currency";
import { INCOME_CATEGORIES, FREQUENCIES } from "../lib/constants";
import { toast } from "sonner@2.0.3";

interface IncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id?: string; // set = edit that income stream, unset = add a new one
}

export function IncomeDialog({ open, onOpenChange, id }: IncomeDialogProps) {
  const { incomeStreams, accounts, assets, addIncome, updateIncome, profile } = useData();
  const income = incomeStreams.find(i => i.id === id);

  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [category, setCategory] = useState("Employment");
  const [frequency, setFrequency] = useState("monthly");
  const [accountId, setAccountId] = useState("");
  const [assetId, setAssetId] = useState("");

  useEffect(() => {
    if (!open) return;
    setSource(income?.source ?? "");
    setAmount(income?.amount.toString() ?? "");
    setCurrency(income?.currency ?? profile?.currency ?? "USD");
    setCategory(income?.category ?? "Employment");
    setFrequency(income?.frequency ?? "monthly");
    setAccountId(income?.accountId ?? "");
    setAssetId(income?.assetId ?? "");
  }, [open, income]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !amount || !accountId) return;

    const data = {
      source,
      amount: parseFloat(amount),
      currency,
      category,
      frequency,
      accountId,
      assetId: assetId || undefined
    };
    if (id) updateIncome(id, data);
    else addIncome(data);

    toast.success(`Income "${source}" has been ${id ? "updated" : "added"}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{id ? "Edit Income" : "Add Income Source"}</DialogTitle>
          <DialogDescription>
            {id ? "Update your income stream" : "Track a new source of income"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="source">Income Source</Label>
            <Input
              id="source"
              placeholder="e.g., Salary, Freelance Project"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="mt-2"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {getCurrencySymbol(currency)}
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
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
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INCOME_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="account">Deposit Account</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="asset">Linked Asset (Optional)</Label>
            <Select value={assetId || "_none"} onValueChange={(val) => setAssetId(val === "_none" ? "" : val)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">None</SelectItem>
                {assets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Link to track asset profitability (e.g., rental income from a property)
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <PrimaryButton type="submit">{id ? "Save Changes" : "Add Income"}</PrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
