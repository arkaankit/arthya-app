import { Card } from "./ui/card";
import { PixelSprite } from "./PixelSprite";
import type { Palette, SpriteRows } from "../lib/sprites";

interface DashboardMetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  valueClass?: string;
  sprite: { rows: SpriteRows; palette: Palette };
}

const TONE = {
  positive: 'text-green-600 dark:text-green-400',
  negative: 'text-red-600 dark:text-red-400',
  neutral: 'text-muted-foreground',
};

export function DashboardMetricCard({ title, value, change, changeType = 'neutral', valueClass = '', sprite }: DashboardMetricCardProps) {
  return (
    <Card className="p-4 sm:p-5 border-border/50 hover:border-border transition-colors">
      <div className="flex items-center gap-4">
        <div className="hidden 2xl:flex w-[60px] h-[60px] shrink-0 rounded-xl bg-secondary items-center justify-center">
          <PixelSprite rows={sprite.rows} palette={sprite.palette} size={42} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">{title}</p>
          <p className={`text-lg sm:text-[22px] font-extrabold truncate ${valueClass}`}>{value}</p>
          {change && <p className={`text-xs ${TONE[changeType]}`}>{change}</p>}
        </div>
      </div>
    </Card>
  );
}
