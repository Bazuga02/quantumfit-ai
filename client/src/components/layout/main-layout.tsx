import { useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  /** When true, uses a tighter header (e.g. nested drill-down views). */
  compact?: boolean;
}

export function MainLayout({ children, title, subtitle, compact }: MainLayoutProps) {
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header onToggleSidebar={toggleSidebar} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="min-h-0 flex-1 overflow-y-auto bg-muted/40 p-4 sm:p-6 dark:bg-background">
          <div className="mx-auto max-w-7xl">
            {(title || subtitle) && (
              <header
                className={cn(
                  "border-b border-border/60",
                  compact ? "mb-6 space-y-2 pb-6" : "mb-8 space-y-3 pb-8"
                )}
              >
                <div className="flex items-start gap-4 sm:gap-5">
                  <div
                    className="mt-1 hidden h-12 w-1 shrink-0 rounded-full bg-gradient-to-b from-primary via-primary to-primary/50 sm:block sm:h-14"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-1 w-10 rounded-full bg-primary/90 sm:hidden" aria-hidden />
                    {title ? (
                      <h1
                        className={cn(
                          "font-bold tracking-tight text-foreground",
                          compact
                            ? "text-2xl sm:text-3xl"
                            : "text-3xl sm:text-4xl"
                        )}
                      >
                        {title}
                      </h1>
                    ) : null}
                    {subtitle ? (
                      <p
                        className={cn(
                          "max-w-3xl text-muted-foreground leading-relaxed",
                          compact ? "text-base" : "text-base sm:text-lg"
                        )}
                      >
                        {subtitle}
                      </p>
                    ) : null}
                  </div>
                </div>
              </header>
            )}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
