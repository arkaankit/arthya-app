import { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./components/ui/sheet";
import { DataProvider, useData } from "./lib/data-context";
import { GuidedTour } from "./components/GuidedTour";
import { DashboardView } from "./components/DashboardView";
import { IncomeView } from "./components/IncomeView";
import { ExpensesView } from "./components/ExpensesView";
import { AccountsView } from "./components/AccountsView";
import { AssetsView } from "./components/AssetsView";
import { PlanningView } from "./components/PlanningView";
import { SettingsView } from "./components/SettingsView";
import { PrivacyInfoPopover } from "./components/PrivacyInfoPopover";
import { ProfileMenu } from "./components/ProfileMenu";
import { ArthyaLogo } from "./components/ArthyaLogo";
import { PixelCloud } from "./components/PixelCloud";
import { Button } from "./components/ui/button";
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Home,
  Target,
  Settings,
  Shield,
  Heart,
  Menu
} from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { storage } from "./lib/storage";

// The "Arthya" wordmark keeps its original amber→yellow→orange colours (Tailwind's stock
// amber-600/yellow-600/orange-600), independent of the app's remapped orange palette.
const WORDMARK_STYLE = {
  fontFamily: "'Eagle Lake', serif",
  backgroundImage:
    "linear-gradient(to right in oklab, oklch(66.6% 0.179 58.318), oklch(68.1% 0.162 75.834), oklch(64.6% 0.222 41.116))",
};

type ViewType ='dashboard' | 'income' | 'expenses' | 'accounts' | 'assets' | 'planning' | 'settings';

function AppContent() {
  const { profile, updateProfile, accounts, assets, incomeStreams, expenses, resetData } = useData();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showTourManually, setShowTourManually] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Use ref to track previous counts to avoid infinite loops
  const previousDataCountsRef = useRef({
    accounts: 0,
    assets: 0,
    income: 0,
    expenses: 0
  });
  
  // Initialize default profile on first launch
  useEffect(() => {
    if (isInitialized) return;
    
    // Load dark mode preference
    const prefs = storage.getPreferences();
    setIsDarkMode(prefs.isDarkMode);
    if (prefs.isDarkMode) {
      document.documentElement.classList.add('dark');
    }
    
    // Create minimal default profile if none exists
    if (!profile) {
      const defaultProfile = {
        name: 'User',
        email: '',
        currency: 'USD',
        hasCompletedOnboarding: false
      };
      updateProfile(defaultProfile);
    }
    
    setIsInitialized(true);
  }, [profile, updateProfile, isInitialized]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark');
    storage.setPreferences({ isDarkMode: newDarkMode });
  };
  
  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      resetData();
      localStorage.removeItem('guidedTourDismissed');
      setShowTourManually(false);
      toast.success('All data has been reset. Guided tour will restart.');
    }
  };

  const handleRestartTour = () => {
    localStorage.removeItem('guidedTourDismissed');
    setCurrentView('dashboard');
    // Small delay to ensure navigation happens first
    setTimeout(() => {
      setShowTourManually(true);
      toast.success('Guided tour restarted!');
    }, 100);
  };

  // Auto-navigate back to dashboard when user completes a tour step
  useEffect(() => {
    if (!isInitialized) return;

    const currentCounts = {
      accounts: accounts.length,
      assets: assets.length,
      income: incomeStreams.length,
      expenses: expenses.length
    };

    const previousCounts = previousDataCountsRef.current;

    // Check if any data was added (count increased)
    const accountAdded = currentCounts.accounts > previousCounts.accounts;
    const assetAdded = currentCounts.assets > previousCounts.assets;
    const incomeAdded = currentCounts.income > previousCounts.income;
    const expenseAdded = currentCounts.expenses > previousCounts.expenses;

    // If user added something and is not on dashboard, navigate back
    if ((accountAdded || assetAdded || incomeAdded || expenseAdded) && currentView !== 'dashboard') {
      // Check if tour is active (not dismissed)
      const tourDismissed = localStorage.getItem('guidedTourDismissed');
      if (tourDismissed !== 'true') {
        setTimeout(() => {
          setCurrentView('dashboard');
        }, 500); // Small delay to let the user see the success message
      }
    }

    // Update previous counts ref
    previousDataCountsRef.current = currentCounts;
  }, [accounts.length, assets.length, incomeStreams.length, expenses.length, currentView, isInitialized]);


  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'assets', label: 'Assets', icon: Home },
    { id: 'planning', label: 'Planning', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'income':
        return <IncomeView />;
      case 'expenses':
        return <ExpensesView />;
      case 'accounts':
        return <AccountsView />;
      case 'assets':
        return <AssetsView />;
      case 'planning':
        return <PlanningView />;
      case 'settings':
        return <SettingsView onResetData={handleResetData} onRestartTour={handleRestartTour} />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <>
      <div className="flex min-h-screen w-full bg-background">
        {/* Overlay Menu */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetContent side="left" className="w-[280px] p-0 bg-card">
            <SheetHeader className="h-[76px] p-0 border-b border-border/50">
              <div className="flex items-center gap-3 px-6 h-full">
                <ArthyaLogo size={40} />
                <div>
                  <SheetTitle className="bg-clip-text text-transparent" style={WORDMARK_STYLE}>Arthya</SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground">Smart Financial Planning</SheetDescription>
                </div>
              </div>
            </SheetHeader>
            
            <div className="flex flex-col gap-0">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id as ViewType);
                    setIsMenuOpen(false);
                  }}
                  className={`mx-3 my-0.5 h-11 flex items-center justify-start px-4 gap-3 rounded-md text-sm font-medium transition-colors ${
                    currentView === item.id
                      ? 'bg-accent text-orange-600 dark:text-orange-400 shadow-pressed'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <main className="flex-1 overflow-auto">
          <div className="border-b border-border bg-card/90 backdrop-blur sticky top-0 z-10">
            <div className="flex items-center gap-4 px-6 py-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMenuOpen(true)}
                className="size-7"
              >
                <Menu className="w-5 h-5" />
              </Button>
                
                {/* Logo */}
                <div className="flex items-center gap-3">
                  <ArthyaLogo size={40} />
                  <div>
                    <h3 className="bg-clip-text text-transparent" style={WORDMARK_STYLE}>Arthya</h3>
                    <p className="text-xs text-muted-foreground">Smart Financial Planning</p>
                  </div>
                </div>
                
                <div className="flex-1 hidden md:flex justify-center">
                  <PixelCloud size={54} className="-translate-x-16 translate-y-1" />
                </div>
                <div className="flex-1 md:hidden" />
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span>All data stored locally</span>
                  </div>
                  <PrivacyInfoPopover />
                  <ProfileMenu 
                    onNavigateToSettings={() => setCurrentView('settings')}
                    isDarkMode={isDarkMode}
                    onToggleDarkMode={toggleDarkMode}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 lg:p-8">
              <div className="max-w-[1600px] mx-auto">
                {renderView()}
              </div>
            </div>
            
            {/* Footer */}
            <footer className="relative mt-auto overflow-hidden bg-[#6c3200]">
              <PixelCloud size={64} className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30 hidden sm:block" />
              <PixelCloud size={44} className="absolute right-10 top-2 opacity-25 hidden sm:block" />
              <div className="relative max-w-[1600px] mx-auto px-6 py-6">
                <p className="text-center text-sm text-[#f5e6dc] flex items-center justify-center gap-1.5">
                  Made with <Heart className="w-4 h-4 text-red-400 fill-red-400 animate-pulse" /> by{' '}
                  <a
                    href="https://arkaankit.myportfolio.com/design-work"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-white underline-offset-4 hover:underline hover:decoration-orange-500"
                  >
                    Arka Ankit
                  </a>
                </p>
              </div>
            </footer>
          </main>
        </div>
      
      {/* Guided Tour Overlay */}
      <GuidedTour
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view as ViewType)}
        hasAccounts={accounts.length > 0}
        hasAssets={assets.length > 0}
        hasIncome={incomeStreams.length > 0}
        hasExpenses={expenses.length > 0}
        forceShow={showTourManually}
      />
      
      <Toaster position="top-right" />
    </>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
