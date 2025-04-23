import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  iconBgClass: string;
  trend: {
    value: string;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, icon, iconBgClass, trend }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="mt-1 text-2xl font-semibold">{value}</h3>
            <p className={cn(
              "text-sm mt-1 flex items-center",
              trend.isPositive ? "text-success-600" : "text-warning-500"
            )}>
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>{trend.value}</span>
            </p>
          </div>
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center",
            iconBgClass
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
