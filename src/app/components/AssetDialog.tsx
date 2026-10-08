import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { PrimaryButton } from "./PrimaryButton";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useData } from "../lib/data-context";
import { CURRENCIES, getCurrencySymbol } from "../lib/currency";
import { ASSET_TYPES, ASSET_COLORS } from "../lib/asset-types";
import { toast } from "sonner@2.0.3";

type AssetType = "property" | "vehicle" | "equipment" | "other";

interface AssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id?: string; // set = edit that asset, unset = add a new one
}

export function AssetDialog({ open, onOpenChange, id }: AssetDialogProps) {
  const { assets, addAsset, updateAsset, profile } = useData();
  const asset = assets.find(a => a.id === id);

  const [name, setName] = useState("");
  const [type, setType] = useState<AssetType>("property");
  const [purchaseValue, setPurchaseValue] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(ASSET_COLORS[0].value);

  useEffect(() => {
    if (!open) return;
    setName(asset?.name ?? "");
    setType(asset?.type ?? "property");
    setPurchaseValue(asset?.purchaseValue.toString() ?? "");
    setCurrentValue(asset?.currentValue.toString() ?? "");
    setCurrency(asset?.currency ?? profile?.currency ?? "USD");
    setPurchaseDate(asset?.purchaseDate ?? "");
    setDescription(asset?.description ?? "");
    setColor(asset?.color ?? ASSET_COLORS[0].value);
  }, [open, asset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !purchaseValue || !purchaseDate) return;

    const data = {
      name,
      type,
      purchaseValue: parseFloat(purchaseValue),
      currentValue: parseFloat(currentValue) || parseFloat(purchaseValue),
      currency,
      purchaseDate,
      description,
      color
    };
    if (id) updateAsset(id, data);
    else addAsset(data);

    toast.success(`Asset "${name}" has been ${id ? "updated" : "added"}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{id ? "Edit Asset" : "Add New Asset"}</DialogTitle>
          <DialogDescription>
            {id ? "Update your asset information" : "Track properties, vehicles, equipment and other assets"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Asset Name</Label>
            <Input
              id="name"
              placeholder="e.g., Main House, Tesla Model 3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2"
              required
            />
          </div>

          <div>
            <Label>Asset Type</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {ASSET_TYPES.map((assetType) => (
                <button
                  key={assetType.value}
                  type="button"
                  onClick={() => setType(assetType.value)}
                  className={`p-4 border-2 rounded-lg transition-all text-left ${
                    type === assetType.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-2xl mb-1">{assetType.icon}</div>
                  <p className="text-sm">{assetType.label}</p>
                  <p className="text-xs text-muted-foreground">{assetType.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label htmlFor="purchaseValue">Purchase Value</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {getCurrencySymbol(currency)}
                </span>
                <Input
                  id="purchaseValue"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={purchaseValue}
                  onChange={(e) => setPurchaseValue(e.target.value)}
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
            <Label htmlFor="currentValue">Current Value (Optional)</Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {getCurrencySymbol(currency)}
              </span>
              <Input
                id="currentValue"
                type="number"
                step="0.01"
                placeholder="Same as purchase value"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input
              id="purchaseDate"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="mt-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Additional details about this asset..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="color">Color Tag</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSET_COLORS.map((c) => (
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
            <PrimaryButton type="submit">{id ? "Save Changes" : "Add Asset"}</PrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
