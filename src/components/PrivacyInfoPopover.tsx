import { Info } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Shield, Sparkles } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

export function PrivacyInfoPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
        >
          <Info className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-4">
            {/* About Arthya Section */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="mb-2">About Arthya</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    <strong className="text-foreground">Arthya</strong> (Sanskrit for "wealth" or "prosperity") is your comprehensive financial planning companion, designed specifically for entrepreneurs and individuals managing multiple income sources.
                  </p>
                  <div>
                    <p className="text-foreground mb-1">Key Benefits:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Track unlimited income sources and expense categories</li>
                      <li>Monitor assets, investments, and net worth in real-time</li>
                      <li>Set and achieve financial goals with intelligent forecasting</li>
                      <li>Multi-currency support for global entrepreneurs</li>
                      <li>Complete privacy - all data stays on your device</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Section */}
            <div className="pt-3 border-t border-border">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h4 className="mb-1.5">Privacy-First Design</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your financial data never leaves your device. Everything is stored locally in your browser's storage.
                  </p>
                </div>
              </div>
              
              <div className="pt-3 space-y-2 ml-11">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400 mt-1.5" />
                  <p className="text-sm text-muted-foreground">
                    Use real data for actual planning or dummy data for simulations
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400 mt-1.5" />
                  <p className="text-sm text-muted-foreground">
                    No account registration required
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400 mt-1.5" />
                  <p className="text-sm text-muted-foreground">
                    No data collection or cloud sync
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
