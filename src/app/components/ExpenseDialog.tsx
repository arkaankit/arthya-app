import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { PrimaryButton } from "./PrimaryButton";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useData } from "../lib/data-context";
import { CURRENCIES, getCurrencySymbol } from "../lib/currency";
import { EXPENSE_CATEGORIES, FREQUENCIES } from "../lib/constants";
import { toast } from "sonner@2.0.3";

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id?: string; // set = edit that expense, unset = add a new one
}

export function ExpenseDialog({ open, onOpenChange, id }: ExpenseDialogProps) {
  const { expenses, accounts, assets, addExpense, updateExpense, profile } = useData();
  const expense = expenses.find(e => e.id === id);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [category, setCategory] = useState("Housing");
  const [subcategory, setSubcategory] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [accountId, setAccountId] = useState("");
  const [assetId, setAssetId] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(expense?.name ?? "");
    setAmount(expense?.amount.toString() ?? "");
    setCurrency(expense?.currency ?? profile?.currency ?? "USD");
    setCategory(expense?.category ?? "Housing");
    setSubcategory(expense?.subcategory ?? "");
    setFrequency(expense?.frequency ?? "monthly");
    setAccountId(expense?.accountId ?? "");
    setAssetId(expense?.assetId ?? "");
  }, [open, expense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !accountId) return;

    const data = {
      name,
      amount: parseFloat(amount),
      currency,
      category,
      subcategory: subcategory || category,
      frequency,
      accountId,
      assetId: assetId || undefined
    };
    if (id) updateExpense(id, data);
    else addExpense(data);

    toast.success(`Expense "${name}" has been ${id ? "updated" : "added"}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{id ? "Edit Expense" : "Add Expense"}</DialogTitle>
          <DialogDescription>
            {id ? "Update your expense" : "Track a new expense or bill"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Expense Name</Label>
            <Input
              id="name"
              placeholder="e.g., Rent, Groceries"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
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
            <Select value={category} onValueChange={(v) => { setCategory(v); setSubcategory(""); }}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(EXPENSE_CATEGORIES).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subcategory">Subcategory (Optional)</Label>
            <Select value={subcategory} onValueChange={setSubcategory}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES[category as keyof typeof EXPENSE_CATEGORIES]?.map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="account">Payment Account</Label>
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
              Link to track asset costs (e.g., maintenance for a car or property)
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <PrimaryButton type="submit">{id ? "Save Changes" : "Add Expense"}</PrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
