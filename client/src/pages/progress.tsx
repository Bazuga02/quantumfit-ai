import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Activity, Calendar, TrendingUp, Weight } from "lucide-react";

export default function ProgressPage() {
  return (
    <MainLayout 
      title="Progress" 
      subtitle="Track your body measurements and visual progress over time."
    >
      <div className="max-w-6xl mx-auto min-h-screen w-full px-4 py-4">
        <ProgressSection />
      </div>
    </MainLayout>
  );
} 