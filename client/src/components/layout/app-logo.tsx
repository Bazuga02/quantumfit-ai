import { cn } from "@/lib/utils";

type AppLogoSize = "sm" | "md" | "lg";

type AppLogoProps = {
  className?: string;
  size?: AppLogoSize;
  showText?: boolean;
};

const sizeStyles: Record<
  AppLogoSize,
  { badge: string; iconWrap: string; title: string; subtitle: string }
> = {
  sm: {
    badge: "h-8 w-8",
    iconWrap: "h-5 w-5",
    title: "text-sm",
    subtitle: "text-[10px]",
  },
  md: {
    badge: "h-10 w-10",
    iconWrap: "h-6 w-6",
    title: "text-sm",
    subtitle: "text-[11px]",
  },
  lg: {
    badge: "h-12 w-12",
    iconWrap: "h-7 w-7",
    title: "text-xl",
    subtitle: "text-xs",
  },
};

export function AppLogo({ className, size = "md", showText = true }: AppLogoProps) {
  const styles = sizeStyles[size];

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-full",
          "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
          "shadow-md ring-2 ring-primary/20",
          styles.badge
        )}
      >
        <div className={cn("overflow-hidden", styles.iconWrap)}>
          <img
            src="/qai-logo.png"
            alt=""
            aria-hidden
            className="h-[220%] w-full object-contain object-top brightness-0 invert"
          />
        </div>
      </div>

      {showText ? (
        <div className="min-w-0 leading-tight">
          <p className={cn("truncate font-bold tracking-tight text-foreground", styles.title)}>
            QuantumFit
          </p>
          <p
            className={cn(
              "truncate font-semibold uppercase tracking-wider text-primary",
              styles.subtitle
            )}
          >
            AI
          </p>
        </div>
      ) : null}
    </div>
  );
}
