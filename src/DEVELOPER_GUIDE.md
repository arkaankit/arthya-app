# Developer Guide - Arthya

## 📚 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Key Concepts](#key-concepts)
4. [File Structure](#file-structure)
5. [Data Flow](#data-flow)
6. [Component Hierarchy](#component-hierarchy)
7. [Recent Changes](#recent-changes)
8. [Development Guidelines](#development-guidelines)

---

## 📋 Project Overview

**Arthya** is a comprehensive financial planning platform inspired by Revolut's modern design aesthetic. Built specifically for entrepreneurs and individuals managing multiple income sources, Arthya provides powerful tools for tracking income, managing expenses, monitoring assets, and achieving financial goals - all with complete privacy as your data stays on your device.

### What Makes Arthya Special?
Arthya combines enterprise-grade financial planning features with a beautiful, intuitive interface and absolute privacy. Unlike traditional financial apps that require cloud sync and data sharing, Arthya stores everything locally in your browser's localStorage - no backend, no account required, no data leaves your device.

### Core Features
- 💰 Multi-source income tracking with frequency-based calculations
- 📊 Multi-category expense management
- 🏦 Multi-account management (bank & investment)
- 🏠 Asset tracking (properties, vehicles, equipment) with profitability analysis
- 🎯 Goal planning with purchase simulators
- 💱 Multi-currency support with automatic conversion
- 🌓 Light/Dark mode
- 🔒 Privacy-first (all data stored locally)

---

## 🏗️ Architecture

### Tech Stack
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Context API
- **Storage**: Browser localStorage
- **UI Components**: Shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React

### Key Design Decisions

#### 1. **Frequency-Based System (NOT Type-Based)**
The app uses **frequency** to handle recurrence, not a separate "type" field.

✅ **Correct Approach:**
```typescript
interface IncomeStream {
  frequency: string; // 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
  // No 'type' field needed!
}
```

❌ **Old Redundant Approach (REMOVED):**
```typescript
// DO NOT USE THIS
type: 'fixed' | 'variable' // ← Redundant with frequency
```

**Why?** Frequency already tells you if something recurs. The old "type" field was confusing and redundant.

#### 2. **Monthly Normalization**
All financial calculations normalize amounts to monthly equivalents for consistent comparison.

```typescript
import { convertToMonthly } from "../lib/frequency";

// Example: $12,000/year salary → $1,000/month
const monthlyAmount = convertToMonthly(12000, 'yearly'); // Returns 1000
```

#### 3. **Multi-Currency with Base Currency**
- Each item (income/expense/account) can have its own currency
- All amounts convert to the user's base currency for totals
- Conversion uses fixed rates in `/lib/currency.ts`

---

## 🔑 Key Concepts

### 1. Data Models (`/lib/storage.ts`)

All interfaces are thoroughly documented. Key models:

- **Account**: Bank accounts or investment accounts
- **Asset**: Physical/financial assets (can link income & expenses)
- **IncomeStream**: Sources of income with frequency
- **Expense**: Spending with frequency and category
- **Goal**: Savings goals with targets and deadlines
- **UserProfile**: User preferences and onboarding status

### 2. Frequency Conversion (`/lib/frequency.ts`)

Central utility for handling different payment frequencies:

```typescript
convertToMonthly(amount, frequency)  // → Monthly equivalent
convertToYearly(amount, frequency)    // → Yearly equivalent
getFrequencyLabel(frequency)          // → Human-readable label
```

### 3. Currency Conversion (`/lib/currency.ts`)

Handles multi-currency with 20+ supported currencies:

```typescript
convertCurrency(amount, fromCurrency, toCurrency)
formatCurrency(amount, currency)
getCurrencySymbol(currency)
getCurrencyFlag(currency)
```

### 4. Context State Management (`/lib/data-context.tsx`)

Global state provider with CRUD operations for all entities:
- Profile management
- Account operations
- Asset management
- Income/Expense operations
- Goal tracking

---

## 📁 File Structure

```
/
├── App.tsx                          # Main app entry with routing
├── lib/
│   ├── storage.ts                   # Data models & localStorage utilities
│   ├── data-context.tsx             # React Context for global state
│   ├── frequency.ts                 # Frequency conversion utilities
│   ├── currency.ts                  # Currency conversion & formatting
│   ├── asset-types.ts               # Asset type definitions & icons
│   └── mock-data.ts                 # Sample data for testing
│
├── components/
│   ├── OnboardingFlow.tsx           # 4-step onboarding wizard
│   │
│   ├── DashboardView.tsx            # Main dashboard with charts
│   ├── IncomeView.tsx               # Income management view
│   ├── ExpensesView.tsx             # Expense management view
│   ├── AccountsView.tsx             # Account management view
│   ├── AssetsView.tsx               # Asset management with profitability
│   ├── PlanningView.tsx             # Goals & purchase simulator
│   ├── SettingsView.tsx             # App settings & currency config
│   │
│   ├── Add*Dialog.tsx               # Creation dialogs for entities
│   ├── Edit*Dialog.tsx              # Edit dialogs for entities
│   ├── *Card.tsx                    # Display cards for entities
│   ├── *Item.tsx                    # List item components
│   │
│   ├── GuidancePanel.tsx            # Financial insights & tips
│   ├── DashboardMetricCard.tsx      # Metric display component
│   │
│   └── ui/                          # Shadcn/ui components (43 components)
│
└── styles/
    └── globals.css                  # Tailwind v4 config & typography
```

---

## 🔄 Data Flow

### 1. **User Input Flow**
```
User Action → Dialog/Form → data-context → localStorage → State Update → UI Re-render
```

### 2. **Calculation Flow**
```
Raw Data → Currency Conversion → Frequency Normalization → Aggregation → Display
```

Example:
```typescript
// 1. Get raw data
const incomeStreams = useData().incomeStreams;

// 2. Convert to base currency
const converted = convertCurrency(income.amount, income.currency, baseCurrency);

// 3. Normalize to monthly
const monthly = convertToMonthly(converted, income.frequency);

// 4. Aggregate
const totalIncome = incomeStreams.reduce((sum, income) => {
  const converted = convertCurrency(income.amount, income.currency, baseCurrency);
  const monthly = convertToMonthly(converted, income.frequency);
  return sum + monthly;
}, 0);

// 5. Display
formatCurrency(totalIncome, baseCurrency)
```

---

## 🧩 Component Hierarchy

### Main Views
- **App.tsx**
  - **OnboardingFlow** (first-time setup)
  - **Sidebar** (navigation)
  - **View Components** (conditional rendering based on route)
    - DashboardView
    - IncomeView
    - ExpensesView
    - AccountsView
    - AssetsView
    - PlanningView
    - SettingsView

### Common Patterns

#### 1. View Components
Each view follows this pattern:
```tsx
export function SomeView() {
  const { data, profile } = useData();
  const [showDialog, setShowDialog] = useState(false);
  
  // Calculate totals with currency & frequency conversion
  const total = data.reduce((sum, item) => {
    const converted = convertCurrency(item.amount, item.currency, baseCurrency);
    const monthly = convertToMonthly(converted, item.frequency);
    return sum + monthly;
  }, 0);
  
  return (
    <>
      <AddDialog open={showDialog} onOpenChange={setShowDialog} />
      {/* Summary cards */}
      {/* Data list/grid */}
    </>
  );
}
```

#### 2. Dialog Components
All Add/Edit dialogs follow this pattern:
```tsx
export function AddSomethingDialog({ open, onOpenChange }) {
  const { addSomething, profile } = useData();
  const [field, setField] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    addSomething({ /* data */ });
    // Reset form
    onOpenChange(false);
  };
  
  return <Dialog>...</Dialog>;
}
```

#### 3. Card/Item Components
Display components with edit/delete actions:
```tsx
export function SomeCard({ id, ...props }) {
  const { deleteSomething } = useData();
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  return (
    <>
      <EditDialog open={showEditDialog} ... />
      <Card>
        {/* Content */}
        <Button onClick={() => setShowEditDialog(true)}>Edit</Button>
        <Button onClick={handleDelete}>Delete</Button>
      </Card>
    </>
  );
}
```

---

## 🆕 Recent Changes

### ✅ Major Cleanup (Latest)

#### 1. **Removed Redundant "Type" Field**
- **Removed from**: `IncomeStream` and `Expense` interfaces
- **Reason**: Frequency field already handles recurrence
- **Impact**: Simplified data model, removed confusing UI elements

**Before:**
```typescript
interface Expense {
  frequency: string;
  type: 'recurring' | 'variable'; // ❌ Redundant!
}
```

**After:**
```typescript
interface Expense {
  frequency: string; // ✅ Only this is needed!
}
```

#### 2. **Updated All Dialogs**
- Removed "Income Type" / "Expense Type" selection UI
- Simplified forms (one less field to fill)

#### 3. **Updated Display Components**
- Removed type display from IncomeStreamItem and ExpenseItem
- Removed type-based filtering from IncomeView and ExpensesView
- Updated dashboard stats to show categories instead of types

#### 4. **Fixed Frequency Calculations**
- Created `/lib/frequency.ts` utility module
- All totals now properly convert weekly/yearly to monthly
- Example: $12,000/year now correctly shows as $1,000/month

#### 5. **Added Comprehensive Documentation**
- Added JSDoc comments to all interfaces in `storage.ts`
- Clear explanation of business logic
- This developer guide!

### 📝 Unused Components
- **HelpTooltip.tsx** - Currently unused, can be removed if not needed

---

## 💻 Development Guidelines

### 1. **Adding New Features**

When adding a new feature:
1. Update data model in `/lib/storage.ts` (with JSDoc)
2. Add CRUD operations to `/lib/data-context.tsx`
3. Create Add/Edit dialogs in `/components`
4. Create display components (Card/Item)
5. Create or update View component
6. Update navigation if needed

### 2. **Working with Currencies**

Always follow this pattern:
```typescript
import { convertCurrency } from "../lib/currency";
import { convertToMonthly } from "../lib/frequency";

// For totals
const total = items.reduce((sum, item) => {
  const converted = convertCurrency(item.amount, item.currency, baseCurrency);
  const monthly = convertToMonthly(converted, item.frequency);
  return sum + monthly;
}, 0);

// For display
formatCurrency(total, baseCurrency)
```

### 3. **State Management**

Use the data context for all state:
```typescript
const { 
  data, 
  addData, 
  updateData, 
  deleteData 
} = useData();
```

Never manipulate localStorage directly - always go through the context.

### 4. **Styling Conventions**

- Use Tailwind classes (Tailwind v4)
- Follow existing color patterns:
  - Income: green-500/600
  - Expenses: red-500/600
  - Assets: blue-500/600
  - Goals: purple-500/600
- **DO NOT** override typography (font-size, font-weight, line-height) unless specifically needed
- Use design tokens defined in `globals.css`

### 5. **Component Creation**

Follow naming conventions:
- Views: `*View.tsx`
- Dialogs: `Add*Dialog.tsx` / `Edit*Dialog.tsx`
- Display: `*Card.tsx` / `*Item.tsx`
- Use consistent prop interfaces

### 6. **Testing Locally**

Use mock data for testing:
```typescript
import { generateMockData } from "./lib/mock-data";

// In development only
const mockData = generateMockData();
```

---

## 🔍 Common Tasks

### Adding a New Currency

Edit `/lib/currency.ts`:
```typescript
export const CURRENCIES = [
  // ... existing
  { code: 'NEW', name: 'New Currency', symbol: 'N', flag: '🚩', rate: 1.0 }
];
```

### Adding a New Expense Category

Edit `/components/AddExpenseDialog.tsx`:
```typescript
const EXPENSE_CATEGORIES = {
  // ... existing
  NewCategory: ['Subcategory1', 'Subcategory2']
};
```

### Changing Frequency Options

Edit any dialog with frequency selector:
```typescript
const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },    // Add new frequency
  { value: 'weekly', label: 'Weekly' },
  // ... existing
];
```

Then update `/lib/frequency.ts` conversion rates.

---

## 🐛 Debugging Tips

### 1. **Check localStorage**
Open DevTools → Application → Local Storage → View financeflow_* keys

### 2. **Reset Data**
Settings → Reset All Data (or clear localStorage manually)

### 3. **Currency Conversion Issues**
- Verify rates in `/lib/currency.ts`
- Check if `convertCurrency()` is called correctly
- Ensure base currency is set in profile

### 4. **Frequency Calculation Issues**
- Verify `convertToMonthly()` is used in all totals
- Check conversion rates in `/lib/frequency.ts`
- Console.log the raw vs converted amounts

---

## 📞 Support

For questions or issues:
1. Check this guide first
2. Review interface documentation in `/lib/storage.ts`
3. Check component patterns in existing files
4. Review the codebase structure above

---

**Last Updated**: $(date)
**Version**: 1.0.0
**Maintained By**: Development Team
