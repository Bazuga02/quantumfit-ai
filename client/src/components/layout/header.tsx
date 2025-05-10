import { useAuth } from "@/hooks/use-auth";
import { Bell, Menu, Moon, Search, Sun, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
          {/* Search icon */}
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="w-5 h-5" />
          </Button>

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle dark mode">
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* User menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user?.name || 'User'} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Your Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
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
