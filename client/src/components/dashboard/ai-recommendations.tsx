import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Sparkles } from "lucide-react";
import { Link } from "wouter";

export function AIRecommendations() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center">
            <BrainCircuit className="h-5 w-5 mr-2 text-primary" />
            AI Coach Recommendations
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Get personalized workout and nutrition recommendations from your AI coach. Ask for exercise modifications, meal ideas, or progress insights.
        </p>
        <Link href="/ai-coach">
          <Button className="w-full sm:w-auto" size="sm">
            <Sparkles className="h-4 w-4 mr-2" />
            Ask AI for recommendations
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
