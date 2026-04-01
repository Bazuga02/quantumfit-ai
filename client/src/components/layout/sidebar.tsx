import { useAuth } from "@/hooks/use-auth";
import { NavLink } from "./nav-link";
import {
  Activity,
  LayoutDashboard,
  Dumbbell,
  Apple,
  Droplets,
  LineChart,
  BrainCircuit,
  Settings,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocation } from "wouter";
import { useMobile } from "@/hooks/use-mobile";
import Lottie from "lottie-react";
import { cn } from "@/lib/utils";
import dashboardAnimation from "@/components/layout/animation/dashboard.json";
import workoutAnimation from "@/components/layout/animation/workout.json";
import nutritionAnimation from "@/components/layout/animation/nutrition.json";
import waterAnimation from "@/components/layout/animation/water-intake.json";
import progressAnimation from "@/components/layout/animation/progress.json";
import aiAnimation from "@/components/layout/animation/ai.json";
import settingsAnimation from "@/components/layout/animation/setting.json";

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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const isMobile = useMobile();

  const links = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/workouts", icon: Dumbbell, label: "Workouts" },
    { path: "/nutrition", icon: Apple, label: "Nutrition" },
    { path: "/water", icon: Droplets, label: "Water" },
    { path: "/progress", icon: LineChart, label: "Progress" },
    { path: "/ai-coach", icon: BrainCircuit, label: "AI Coach" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  const animationMap: Record<string, object> = {
    "/": dashboardAnimation,
    "/workouts": workoutAnimation,
    "/nutrition": nutritionAnimation,
    "/water": waterAnimation,
    "/progress": progressAnimation,
    "/ai-coach": aiAnimation,
    "/settings": settingsAnimation,
  };
  const activeAnimation = animationMap[location];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[17rem] shrink-0 flex-col",
        "border-r border-border/80 bg-card shadow-xl shadow-black/5 dark:shadow-black/20",
        "transform transition-transform duration-300 ease-out",
        "lg:static lg:z-auto lg:h-full lg:w-64 lg:translate-x-0 lg:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="sidebar-scroll flex max-h-full min-h-0 flex-1 flex-col overflow-y-auto lg:h-full">
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border/60 px-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md ring-2 ring-primary/20">
              <Activity className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-foreground">QuantumFit</p>
              <p className="truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Training
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {activeAnimation ? (
          <div className="shrink-0 border-b border-border/60 bg-muted/20 px-3 py-3 dark:bg-muted/10">
            <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Spotlight
            </p>
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 px-2 py-3 dark:bg-card/50">
              <Lottie
                animationData={activeAnimation}
                loop
                className="mx-auto"
                style={{ width: 140, height: 140 }}
              />
            </div>
          </div>
        ) : null}

        {/* Nav */}
        <nav className="flex-1 space-y-px p-2">
          <p className="mb-1 px-2 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Menu
          </p>
          {links.map((link) => {
            const isActive = location === link.path;
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                href={link.path}
                active={isActive}
                onNavigate={isMobile ? onClose : undefined}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={isActive ? 2.25 : 2} aria-hidden />
                </span>
                <span className="truncate leading-tight">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {user ? (
          <div className="shrink-0 border-t border-border/60 p-3">
            <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-muted/30 p-3 dark:bg-muted/15">
              <Avatar className="h-10 w-10 border-2 border-background shadow-sm ring-2 ring-primary/25">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/75 text-xs font-bold text-primary-foreground">
                  {userInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
