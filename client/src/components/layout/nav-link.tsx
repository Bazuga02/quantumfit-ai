import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  /** e.g. close mobile drawer after navigation */
  onNavigate?: () => void;
}

export function NavLink({ href, children, active, onNavigate }: NavLinkProps) {
  return (
    <Link href={href}>
      <a
        href={href}
        onClick={() => onNavigate?.()}
        className={cn(
          "group flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium transition-all duration-200",
          active
            ? "bg-primary/15 font-semibold text-primary shadow-sm ring-1 ring-primary/15"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
        )}
      >
        {children}
      </a>
    </Link>
  );
}
