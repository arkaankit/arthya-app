import { Card } from "./ui/card";
import { LucideIcon } from "lucide-react";

interface DashboardMetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor: string;
}

export function DashboardMetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor
}: DashboardMetricCardProps) {
  return (
    <Card className="p-6 border-border/50 hover:border-border transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground mb-2">{title}</p>
          <h3 className="mb-1">{value}</h3>
          {change && (
            <p className={`text-sm ${
              changeType === 'positive' ? 'text-green-600 dark:text-green-400' :
              changeType === 'negative' ? 'text-red-600 dark:text-red-400' :
              'text-muted-foreground'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div 
          className="p-3 rounded-xl"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <Icon className="w-6 h-6" style={{ color: iconColor }} />
        </div>
      </div>
    </Card>
  );
}
