/**
 * Shared constants used across the application
 */

export const COLORS = [
  { value: '#F59E0B', label: 'Amber' },
  { value: '#FBBF24', label: 'Yellow' },
  { value: '#F97316', label: 'Orange' },
  { value: '#10B981', label: 'Green' },
  { value: '#3B82F6', label: 'Blue' },
  { value: '#EF4444', label: 'Red' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#14B8A6', label: 'Teal' },
];

export const EXPENSE_CATEGORIES = {
  Housing: ['Rent', 'Mortgage', 'Utilities', 'Maintenance', 'Property Tax'],
  Transportation: ['Car Payment', 'Gas', 'Insurance', 'Maintenance', 'Public Transit'],
  Family: ['Groceries', 'Childcare', 'Education', 'Healthcare', 'Entertainment'],
  Business: ['Software', 'Equipment', 'Marketing', 'Office', 'Professional Services'],
  Others: ['Subscription', 'Personal', 'Travel', 'Gifts', 'Miscellaneous']
};

export const INCOME_CATEGORIES = [
  'Employment',
  'Freelancing',
  'Business',
  'Investments',
  'Rental',
  'Pension',
  'Royalties',
  'Others'
];

export const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];
