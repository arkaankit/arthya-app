import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { PrimaryButton } from "./PrimaryButton";
import { X, Wallet, Home, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ArthyaLogo } from "./ArthyaLogo";

interface GuidedTourProps {
  currentView: string;
  onNavigate: (view: string) => void;
  hasAccounts: boolean;
  hasAssets: boolean;
  hasIncome: boolean;
  hasExpenses: boolean;
  forceShow?: boolean;
}

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  action?: string;
  actionLabel?: string;
  condition: (props: GuidedTourProps) => boolean;
  targetView: string;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Arthya! 👋",
    description: "Let's get you started! First, create your first account - a bank account or investment account to track your finances.",
    icon: Wallet,
    action: "accounts",
    actionLabel: "Create Account",
    condition: (props) => !props.hasAccounts,
    targetView: "dashboard" // Shows on dashboard when no accounts
  },
  {
    id: "add-assets",
    title: "Great job! Now add your assets 🏠",
    description: "Track your valuable assets like property, vehicles, or investments to build a complete wealth picture.",
    icon: Home,
    action: "assets",
    actionLabel: "Add Assets",
    condition: (props) => props.hasAccounts && !props.hasAssets,
    targetView: "dashboard" // Shows on dashboard after account created
  },
  {
    id: "add-income",
    title: "Excellent! Now track your income 💰",
    description: "Add your income sources to understand your cash flow and financial health.",
    icon: TrendingUp,
    action: "income",
    actionLabel: "Add Income",
    condition: (props) => props.hasAccounts && props.hasAssets && !props.hasIncome,
    targetView: "dashboard" // Shows on dashboard after assets added
  },
  {
    id: "add-expenses",
    title: "Almost done! Manage your expenses 📊",
    description: "Track your spending to make informed financial decisions and stay on budget.",
    icon: TrendingDown,
    action: "expenses",
    actionLabel: "Add Expenses",
    condition: (props) => props.hasAccounts && props.hasAssets && props.hasIncome && !props.hasExpenses,
    targetView: "dashboard" // Shows on dashboard after income added
  },
  {
    id: "complete",
    title: "You're all set! 🎉",
    description: "You can now use all features. Explore the dashboard to see your complete financial overview.",
    icon: Wallet,
    condition: (props) => props.hasAccounts && props.hasAssets && props.hasIncome && props.hasExpenses,
    targetView: "dashboard" // Shows completion on dashboard
  }
];

export function GuidedTour(props: GuidedTourProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentStep, setCurrentStep] = useState<TourStep | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Check if tour is dismissed on mount
  useEffect(() => {
    const dismissed = localStorage.getItem("guidedTourDismissed");
    if (dismissed === "true" && !props.forceShow) {
      setIsDismissed(true);
    }
    // Small delay to ensure data is loaded
    setTimeout(() => setIsReady(true), 500);
  }, [props.forceShow]);

  // Reset dismissed state when forceShow changes
  useEffect(() => {
    if (props.forceShow) {
      setIsDismissed(false);
      setIsVisible(false); // Reset to recalculate
    }
  }, [props.forceShow]);

  useEffect(() => {
    if (!isReady) return;
    if (isDismissed && !props.forceShow) return;

    // Find the current step based on user's progress
    const activeStep = tourSteps.find(step => step.condition(props));
    
    if (activeStep && activeStep.targetView === props.currentView) {
      setCurrentStep(activeStep);
      // Small delay before showing to ensure smooth transition
      setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(false);
    }
  }, [props.currentView, props.hasAccounts, props.hasAssets, props.hasIncome, props.hasExpenses, isReady, isDismissed, props.forceShow]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleDismissForever = () => {
    localStorage.setItem("guidedTourDismissed", "true");
    setIsDismissed(true);
    setIsVisible(false);
  };

  const handleAction = () => {
    if (currentStep?.action) {
      props.onNavigate(currentStep.action);
      setIsVisible(false);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("guidedTourDismissed", "true");
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (isDismissed || !isVisible || !currentStep) {
    return null;
  }

  const Icon = currentStep.icon;
  const isComplete = currentStep.id === "complete";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
        onClick={handleDismiss}
      >
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="w-full max-w-md p-6 relative shadow-2xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="absolute top-4 right-4 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="flex items-start gap-4 mb-4">
              <ArthyaLogo size={48} />
              <div className="flex-1 pr-8">
                <h3 className="mb-2">{currentStep.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {currentStep.description}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={handleDismissForever}
                className="flex-1"
              >
                Skip Tour
              </Button>
              {isComplete ? (
                <PrimaryButton
                  onClick={handleComplete}
                >
                  Get Started
                </PrimaryButton>
              ) : (
                <PrimaryButton
                  onClick={handleAction}
                  icon={<ChevronRight className="w-4 h-4" />}
                >
                  {currentStep.actionLabel}
                </PrimaryButton>
              )}
            </div>

            {!isComplete && (
              <p className="text-xs text-muted-foreground mt-4 text-center">
                You can dismiss this anytime and access features freely
              </p>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}