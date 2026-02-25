import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Target, Trash2, Pencil } from "lucide-react";
import { useData } from "../lib/data-context";
import { EditGoalDialog } from "./EditGoalDialog";
import { toast } from "sonner@2.0.3";

interface GoalProgressCardProps {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

export function GoalProgressCard({
  id,
  name,
  targetAmount,
  currentAmount,
  deadline,
  priority
}: GoalProgressCardProps) {
  const { deleteGoal } = useData();
  const progress = (currentAmount / targetAmount) * 100;
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the goal "${name}"?`)) {
      deleteGoal(id);
      toast.success(`Goal "${name}" has been deleted`);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };
  const priorityColors = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#10B981'
  };

  const daysLeft = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <>
      <EditGoalDialog open={showEditDialog} onOpenChange={setShowEditDialog} goalId={id} />
      <Card className="p-6 border-border/50 group">
        <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${priorityColors[priority]}20` }}
          >
            <Target className="w-5 h-5" style={{ color: priorityColors[priority] }} />
          </div>
          <div>
            <h4 className="mb-1">{name}</h4>
            <p className="text-sm text-muted-foreground">
              {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
            </p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        <Progress value={progress} className="h-2" />
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            ${currentAmount.toLocaleString()} / ${targetAmount.toLocaleString()}
          </p>
          <p className="text-sm" style={{ color: priorityColors[priority] }}>
            {progress.toFixed(1)}%
          </p>
        </div>
      </div>
    </Card>
    </>
  );
}
