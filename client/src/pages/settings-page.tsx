import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Lock, Moon, Sun, User } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    waterIntakeGoal: user?.waterIntakeGoal || 3,
    calorieGoal: user?.calorieGoal || 2500,
    protein: user?.macros?.protein || 150,
    carbs: user?.macros?.carbs || 270,
    fats: user?.macros?.fats || 60
  });
  
  // User settings update mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/user/settings", data);
      return await res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({
        title: "Settings Updated",
        description: "Your settings have been successfully saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "waterIntakeGoal" || name === "calorieGoal" || name === "protein" || name === "carbs" || name === "fats") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSaveProfile = () => {
    updateSettingsMutation.mutate({
      name: formData.name,
      waterIntakeGoal: formData.waterIntakeGoal,
      calorieGoal: formData.calorieGoal,
      macros: {
        protein: formData.protein,
        carbs: formData.carbs,
        fats: formData.fats
      }
    });
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <MainLayout
      title="Settings"
      subtitle="Manage your account settings and preferences."
    >
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Flame className="h-4 w-4" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={formData.name} 
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  name="email"
                  value={formData.email} 
                  onChange={handleInputChange}
                  disabled
                />
                <p className="text-sm text-muted-foreground">
                  Email address cannot be changed
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
              <Button 
                onClick={handleSaveProfile}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">
                <Lock className="mr-2 h-4 w-4" />
                Update Password
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fitness Goals</CardTitle>
              <CardDescription>
                Configure your daily targets and nutritional goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="waterIntakeGoal" className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  Daily Water Intake Goal (Liters)
                </Label>
                <Input 
                  id="waterIntakeGoal" 
                  name="waterIntakeGoal"
                  type="number" 
                  step="0.1" 
                  value={formData.waterIntakeGoal}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="calorieGoal" className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Daily Calorie Goal
                </Label>
                <Input 
                  id="calorieGoal" 
                  name="calorieGoal"
                  type="number" 
                  value={formData.calorieGoal}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-3">Macro Nutrient Goals (grams)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="protein">Protein</Label>
                    <Input 
                      id="protein" 
                      name="protein"
                      type="number" 
                      value={formData.protein}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carbs">Carbohydrates</Label>
                    <Input 
                      id="carbs" 
                      name="carbs"
                      type="number" 
                      value={formData.carbs}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fats">Fats</Label>
                    <Input 
                      id="fats" 
                      name="fats"
                      type="number" 
                      value={formData.fats}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="ml-auto"
                onClick={handleSaveProfile}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                    className="flex flex-col items-center justify-center p-4 h-auto gap-2"
                  >
                    <Sun className="h-6 w-6" />
                    <span>Light</span>
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                    className="flex flex-col items-center justify-center p-4 h-auto gap-2"
                  >
                    <Moon className="h-6 w-6" />
                    <span>Dark</span>
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    onClick={() => setTheme("system")}
                    className="flex flex-col items-center justify-center p-4 h-auto gap-2"
                  >
                    <div className="flex">
                      <Sun className="h-6 w-6" />
                      <Moon className="h-6 w-6" />
                    </div>
                    <span>System</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
