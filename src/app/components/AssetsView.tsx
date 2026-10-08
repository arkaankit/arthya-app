import { useState } from "react";
import { AssetCard } from "./AssetCard";
import { AssetDialog } from "./AssetDialog";
import { PrimaryButton } from "./PrimaryButton";
import { Card } from "./ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { Plus, Home, Car, Wrench, Package, Info, TrendingUp, TrendingDown } from "lucide-react";
import { useData } from "../lib/data-context";
import { formatCurrency, convertCurrency } from "../lib/currency";
import { convertToMonthly } from "../lib/frequency";

export function AssetsView() {
  const { assets, incomeStreams, expenses, profile } = useData();
  const baseCurrency = profile?.currency || 'USD';
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const filteredAssets = filter === 'all' 
    ? assets 
    : assets.filter(a => a.type === filter);

  // Calculate total asset values
  const totalValue = assets.reduce((sum, asset) => {
    return sum + convertCurrency(asset.currentValue, asset.currency, baseCurrency);
  }, 0);

  const totalPurchaseValue = assets.reduce((sum, asset) => {
    return sum + convertCurrency(asset.purchaseValue, asset.currency, baseCurrency);
  }, 0);

  const totalAppreciation = totalValue - totalPurchaseValue;
  const appreciationPercent = totalPurchaseValue > 0 ? (totalAppreciation / totalPurchaseValue) * 100 : 0;

  // Calculate monthly cash flow from assets
  const assetIncome = incomeStreams
    .filter(i => i.assetId)
    .reduce((sum, i) => {
      const converted = convertCurrency(i.amount, i.currency, baseCurrency);
      const monthly = convertToMonthly(converted, i.frequency as any);
      return sum + monthly;
    }, 0);

  const assetExpenses = expenses
    .filter(e => e.assetId)
    .reduce((sum, e) => {
      const converted = convertCurrency(e.amount, e.currency, baseCurrency);
      const monthly = convertToMonthly(converted, e.frequency as any);
      return sum + monthly;
    }, 0);

  const netCashFlow = assetIncome - assetExpenses;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="mb-2">Assets</h2>
          <p className="text-muted-foreground">
            Manage properties, vehicles, and other assets with income and expenses
          </p>
        </div>
        <PrimaryButton icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddDialog(true)}>
          Add Asset
        </PrimaryButton>
      </div>

      <AssetDialog open={showAddDialog} onOpenChange={setShowAddDialog} />

      {assets.length === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Create your first asset to track properties, vehicles, or equipment with their income and expenses.
          </AlertDescription>
        </Alert>
      )}

      {assets.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 border-border/50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-muted-foreground mb-1">Total Asset Value</p>
                  <h3>{formatCurrency(totalValue, baseCurrency)}</h3>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 shadow-sm shadow-amber-500/10">
                  <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {assets.length} assets
              </p>
            </Card>

            <Card className="p-6 border-border/50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-muted-foreground mb-1">Appreciation</p>
                  <h3 className={totalAppreciation >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {totalAppreciation >= 0 ? '+' : ''}{formatCurrency(Math.abs(totalAppreciation), baseCurrency)}
                  </h3>
                </div>
                <div className={`p-3 rounded-xl ${totalAppreciation >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  {totalAppreciation >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {appreciationPercent >= 0 ? '+' : ''}{appreciationPercent.toFixed(1)}% change
              </p>
            </Card>

            <Card className="p-6 border-border/50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-muted-foreground mb-1">Asset Income</p>
                  <h3 className="text-green-600 dark:text-green-400">
                    +{formatCurrency(assetIncome, baseCurrency)}
                  </h3>
                </div>
                <div className="p-3 rounded-xl bg-green-500/10">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Monthly from assets
              </p>
            </Card>

            <Card className="p-6 border-border/50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-muted-foreground mb-1">Net Cash Flow</p>
                  <h3 className={netCashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow, baseCurrency)}
                  </h3>
                </div>
                <div className={`p-3 rounded-xl ${netCashFlow >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  {netCashFlow >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Income - Expenses
              </p>
            </Card>
          </div>

          {/* Filter - Mobile Dropdown */}
          <div className="md:hidden">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select asset type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assets</SelectItem>
                <SelectItem value="property">Property</SelectItem>
                <SelectItem value="vehicle">Vehicles</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter - Desktop Tabs */}
          <Tabs value={filter} className="w-full hidden md:block" onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All Assets</TabsTrigger>
              <TabsTrigger value="property">
                <Home className="w-4 h-4 mr-2" />
                Property
              </TabsTrigger>
              <TabsTrigger value="vehicle">
                <Car className="w-4 h-4 mr-2" />
                Vehicles
              </TabsTrigger>
              <TabsTrigger value="equipment">
                <Wrench className="w-4 h-4 mr-2" />
                Equipment
              </TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Asset Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => (
              <AssetCard key={asset.id} {...asset} />
            ))}
          </div>
        </>
      )}

      {/* Info Card */}
      <Card className="p-6 border-border/50 bg-gradient-to-br from-amber-500/5 to-transparent">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 shadow-sm shadow-amber-500/10 flex-shrink-0">
            <Info className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="mb-2">Asset Management</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Track the profitability of each asset by linking income and expenses. 
              For example, link rental income and maintenance costs to a property to see its net cash flow.
            </p>
            <p className="text-sm text-muted-foreground">
              When adding income or expenses, select the related asset to automatically calculate profitability.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}