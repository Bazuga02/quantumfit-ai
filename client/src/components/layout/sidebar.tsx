import { useAuth } from "@/hooks/use-auth";
import { NavLink } from "./nav-link";
import { Activity, LayoutDashboard, Dumbbell, Apple, Droplets, LineChart, BrainCircuit, Settings, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  const links = [
    { path: "/", icon: <LayoutDashboard className="mr-3 h-5 w-5" />, label: "Dashboard" },
    { path: "/workouts", icon: <Dumbbell className="mr-3 h-5 w-5" />, label: "Workouts" },
    { path: "/nutrition", icon: <Apple className="mr-3 h-5 w-5" />, label: "Nutrition" },
    { path: "/water", icon: <Droplets className="mr-3 h-5 w-5" />, label: "Water Tracking" },
    { path: "/progress", icon: <LineChart className="mr-3 h-5 w-5" />, label: "Progress" },
    { path: "/ai-coach", icon: <BrainCircuit className="mr-3 h-5 w-5" />, label: "AI Coach" },
    { path: "/settings", icon: <Settings className="mr-3 h-5 w-5" />, label: "Settings" },
  ];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto lg:z-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="h-full flex flex-col overflow-y-auto">
        {/* Logo */}
        <div className="p-4 flex items-center h-16 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="bg-primary text-white p-1 rounded">
              <Activity className="w-5 h-5" />
            </div>
            <span className="ml-2 text-lg font-bold">QuantumFit AI</span>
          </div>
          <button 
            className="ml-auto lg:hidden text-gray-500 dark:text-gray-400"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {links.map((link) => (
            <NavLink 
              key={link.path} 
              href={link.path} 
              active={location === link.path}
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Profile */}
        {user && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">View profile</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
