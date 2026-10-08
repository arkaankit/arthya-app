import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useData } from "../lib/data-context";

interface AccountSelectProps {
  label: string;
  value: string; // "" = no account
  onChange: (accountId: string) => void;
}

// Optional account picker shared by the income, expense and goal dialogs.
export function AccountSelect({ label, value, onChange }: AccountSelectProps) {
  const { accounts } = useData();
  // An item can point at an account that was since deleted; show that as "No account".
  const current = accounts.some(a => a.id === value) ? value : "_none";

  return (
    <div>
      <Label htmlFor="account">{label} (Optional)</Label>
      <Select value={current} onValueChange={(v) => onChange(v === "_none" ? "" : v)}>
        <SelectTrigger id="account" className="mt-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_none">No account</SelectItem>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
