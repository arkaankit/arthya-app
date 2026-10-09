// Monthly money in and out per account, from the income and expenses linked to it.
import { convertCurrency } from './currency.ts';
import { convertToMonthly, type Frequency } from './frequency.ts';

interface FlowItem {
  amount: number;
  currency: string;
  frequency: string;
  accountId?: string;
}

export interface Flow {
  in: number; // per month, in the account's own currency
  out: number;
  net: number;
}

export function accountFlows(
  accounts: { id: string; currency: string }[],
  incomes: FlowItem[],
  expenses: FlowItem[],
): Record<string, Flow> {
  const flows: Record<string, Flow> = {};
  for (const a of accounts) flows[a.id] = { in: 0, out: 0, net: 0 };
  const add = (items: FlowItem[], key: 'in' | 'out') => {
    for (const item of items) {
      const account = accounts.find(a => a.id === item.accountId);
      if (!account) continue;
      flows[account.id][key] += convertToMonthly(convertCurrency(item.amount, item.currency, account.currency), item.frequency as Frequency);
    }
  };
  add(incomes, 'in');
  add(expenses, 'out');
  for (const f of Object.values(flows)) f.net = f.in - f.out;
  return flows;
}
