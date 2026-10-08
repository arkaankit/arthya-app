import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { PrimaryButton } from "./PrimaryButton";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DollarSign, Calendar } from "lucide-react";
import { useData } from "../lib/data-context";
import { toast } from "sonner@2.0.3";

type Priority = "high" | "medium" | "low";

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id?: string; // set = edit that goal, unset = add a new one
}

export function GoalDialog({ open, onOpenChange, id }: GoalDialogProps) {
  const { goals, accounts, addGoal, updateGoal } = useData();
  const goal = goals.find(g => g.id === id);

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [accountId, setAccountId] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(goal?.name ?? "");
    setTargetAmount(goal?.targetAmount.toString() ?? "");
    setCurrentAmount(goal?.currentAmount.toString() ?? "");
    setDeadline(goal?.deadline ?? "");
    setPriority(goal?.priority ?? "medium");
    setAccountId(goal?.accountId ?? "");
  }, [open, goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || !deadline || !accountId) return;

    const data = {
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      deadline,
      priority,
      accountId
    };
    if (id) updateGoal(id, data);
    else addGoal(data);

    toast.success(`Goal "${name}" has been ${id ? "updated" : "added"}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{id ? "Edit Goal" : "Create Financial Goal"}</DialogTitle>
          <DialogDescription>
            {id ? "Update your financial goal" : "Set a savings goal and track your progress"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Goal Name</Label>
            <Input
              id="name"
              placeholder="e.g., Emergency Fund, New Car"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="targetAmount">Target Amount</Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="currentAmount">Current Savings</Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="currentAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="deadline">Target Date</Label>
            <div className="relative mt-2">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(v: Priority) => setPriority(v)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="account">Linked Account</Label>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <PrimaryButton type="submit">{id ? "Save Changes" : "Create Goal"}</PrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
