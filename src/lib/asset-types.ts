// Asset management types and utilities

export interface Asset {
  id: string;
  name: string;
  type: 'property' | 'vehicle' | 'equipment' | 'other';
  purchaseValue: number;
  currentValue: number;
  currency: string;
  purchaseDate: string;
  description?: string;
  color: string;
}

export const ASSET_TYPES = [
  { value: 'property', label: 'Property', icon: '🏠', description: 'Houses, apartments, land' },
  { value: 'vehicle', label: 'Vehicle', icon: '🚗', description: 'Cars, motorcycles, boats' },
  { value: 'equipment', label: 'Equipment', icon: '⚙️', description: 'Business equipment, tools' },
  { value: 'other', label: 'Other', icon: '📦', description: 'Other assets' },
] as const;

export const ASSET_COLORS = [
  { value: '#F59E0B', label: 'Amber' },
  { value: '#FBBF24', label: 'Yellow' },
  { value: '#F97316', label: 'Orange' },
  { value: '#FB923C', label: 'Light Orange' },
  { value: '#10B981', label: 'Green' },
  { value: '#EF4444', label: 'Red' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#14B8A6', label: 'Teal' },
];

export function getAssetTypeInfo(type: string) {
  return ASSET_TYPES.find(t => t.value === type) || ASSET_TYPES[3];
}
