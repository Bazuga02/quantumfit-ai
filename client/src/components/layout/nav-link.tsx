import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}

export function NavLink({ href, children, active }: NavLinkProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-2 py-2 text-sm font-medium rounded-md group transition-colors",
          active
            ? "bg-primary/10 text-primary"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        )}
      >
        {children}
      </a>
    </Link>
  );
}
