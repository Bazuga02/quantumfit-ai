import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Menu, Moon, Sun, Activity, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() ?? "U";
}
import { useTheme } from "@/lib/theme-provider";
import { AnimatedRacecarBanner } from "@/components/layout/racecar-banner";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo (Mobile Only) */}
        <div className="lg:hidden flex items-center">
          <div className="flex items-center">
            <div className="bg-primary text-white p-1 rounded">
              <Activity className="w-5 h-5" />
            </div>
            <span className="ml-2 text-lg font-bold">QuantumFit AI</span>
          </div>
        </div>

        <div className="flex items-center gap-3 relative w-full justify-end">
          {/* Animated car with banner - moved to new component */}
          <AnimatedRacecarBanner />

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle dark mode">
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* User menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex max-w-[200px] items-center gap-2 rounded-full py-1 pl-1 pr-2",
                    "outline-none transition-colors hover:bg-muted/80",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  )}
                  aria-label="Open account menu"
                >
                  <Avatar className="h-9 w-9 border-2 border-background shadow-md ring-2 ring-primary/30 dark:ring-primary/40">
                    <AvatarFallback
                      className={cn(
                        "bg-gradient-to-br from-primary to-primary/75 text-sm font-bold tracking-tight text-primary-foreground",
                        "shadow-inner"
                      )}
                    >
                      {userInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="hidden h-4 w-4 shrink-0 text-muted-foreground opacity-80 sm:block" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-0.5">
                    <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <style>{`
        @keyframes car-loop {
          0% { right: 0; }
          100% { right: 100vw; }
        }
        .animate-car-loop {
          animation: car-loop 8s linear infinite;
        }
        @keyframes banner-wave {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
        }
        .animate-banner-wave {
          animation: banner-wave 2s ease-in-out infinite;
        }
      `}</style>
    </header>
  );
}
