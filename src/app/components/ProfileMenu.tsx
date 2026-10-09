import { LogOut, Settings as SettingsIcon, Sun, Moon, UserRound } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useData } from "../lib/data-context";
import { toast } from "sonner@2.0.3";
import { levelInfo } from "../lib/game";
import { PlayerAvatar } from "./PlayerAvatar";

interface ProfileMenuProps {
  onNavigateToSettings: () => void;
  onNavigateToProfile: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function ProfileMenu({ onNavigateToSettings, onNavigateToProfile, isDarkMode, onToggleDarkMode }: ProfileMenuProps) {
  const { profile, resetData, game, xp } = useData();
  const level = levelInfo(xp);

  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out? This will reset all your data.')) {
      resetData();
      toast.success('Signed out successfully. All data has been cleared.');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-full"
        >
          <Avatar className="h-9 w-9 border-2 border-amber-500/20 hover:border-amber-500/40 transition-colors">
            <AvatarImage src={profile?.avatar} />
            {game.player ? (
              <AvatarFallback className="bg-secondary">
                <PlayerAvatar size={26} />
              </AvatarFallback>
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-amber-500 via-yellow-600 to-orange-600 text-white text-sm">
                {profile?.name ? getInitials(profile.name) : 'U'}
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p>{profile?.name || 'User'}</p>
            {!game.calm && (
              <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">Level {level.level} · {level.title} · {xp} XP</p>
            )}
            {profile?.email && (
              <p className="text-xs text-muted-foreground">{profile.email}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onNavigateToProfile} className="cursor-pointer">
          <UserRound className="mr-2 h-4 w-4" />
          <span>Your player</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onNavigateToSettings} className="cursor-pointer">
          <SettingsIcon className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onToggleDarkMode} className="cursor-pointer">
          {isDarkMode ? (
            <>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark Mode</span>
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
