import { useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { useMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onToggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            {(title || subtitle) && (
              <div className="mb-6">
                {title && <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>}
                {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
              </div>
            )}
            
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
