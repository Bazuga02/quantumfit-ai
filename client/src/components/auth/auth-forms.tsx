import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { insertUserSchema } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Extended schema for login
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

// Extended schema for registration with fitness data
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and privacy policy",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export function AuthForms() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { loginMutation, registerMutation } = useAuth();
  const [location, navigate] = useLocation();
  const [privacyOpen, setPrivacyOpen] = useState(false);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });

  // Handle login submission
  function onLoginSubmit(data: LoginFormValues) {
   
    loginMutation.mutate(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {

          navigate("/");
        },
      }
    );
  }

  // Handle registration submission
  function onRegisterSubmit(data: RegisterFormValues) {
    const { confirmPassword, agreeTerms, ...userData } = data;
    registerMutation.mutate(userData, {
      onSuccess: () => {
        navigate("/");
      },
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 80 }}
      className="w-full"
    >
      <Card className="w-full shadow-2xl rounded-3xl">
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
          <div className="relative mb-2">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden p-1">
              <TabsTrigger
                value="login"
                className={
                  activeTab === "login"
                    ? "bg-white dark:bg-gray-950 text-[#2A6DFF] dark:text-[#2A6DFF] shadow-[0_2px_16px_0_#2A6DFF22] font-bold z-10 transition-all duration-200 border-2 border-[#2A6DFF] dark:border-[#2A6DFF]"
                    : "bg-transparent text-gray-500 dark:text-gray-300 font-semibold transition-all duration-200"
                }
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className={
                  activeTab === "register"
                    ? "bg-white dark:bg-gray-950 text-[#2A6DFF] dark:text-[#2A6DFF] shadow-[0_2px_16px_0_#2A6DFF22] font-bold z-10 transition-all duration-200 border-2 border-[#2A6DFF] dark:border-[#2A6DFF]"
                    : "bg-transparent text-gray-500 dark:text-gray-300 font-semibold transition-all duration-200"
                }
              >
                Register
              </TabsTrigger>
            </TabsList>
          </div>
          <AnimatePresence mode="wait">
            {activeTab === "login" && (
              <TabsContent value="login" forceMount>
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader>
                    <CardTitle>Welcome back</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="you@example.com"
                                  {...field}
                                  className="transition-all duration-300 focus:shadow-[0_0_0_3px_#2A6DFF44] focus:border-[#2A6DFF]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="********"
                                  {...field}
                                  className="transition-all duration-300 focus:shadow-[0_0_0_3px_#2A6DFF44] focus:border-[#2A6DFF]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex items-center justify-between">
                          <FormField
                            control={loginForm.control}
                            name="rememberMe"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                              </FormItem>
                            )}
                          />
                          <Button variant="link" className="p-0 h-auto text-sm text-[#2A6DFF] hover:underline">Forgot password?</Button>
                        </div>
                        <motion.button
                          type="submit"
                          className="w-full bg-[#2A6DFF] hover:bg-[#1e56cc] text-white font-semibold py-3 rounded-full shadow-lg transition-transform duration-200 active:scale-95"
                          disabled={loginMutation.isPending}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {loginMutation.isPending ? "Signing in..." : "Sign in"}
                        </motion.button>
                      </form>
                    </Form>
                  </CardContent>
                </motion.div>
              </TabsContent>
            )}
            {activeTab === "register" && (
              <TabsContent value="register" forceMount>
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader>
                    <CardTitle>Create your account</CardTitle>
                    <CardDescription>
                      Join QuantumFit AI to track your fitness journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="John Doe"
                                  {...field}
                                  className="transition-all duration-300 focus:shadow-[0_0_0_3px_#2A6DFF44] focus:border-[#2A6DFF]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="you@example.com"
                                  {...field}
                                  className="transition-all duration-300 focus:shadow-[0_0_0_3px_#2A6DFF44] focus:border-[#2A6DFF]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="********"
                                  {...field}
                                  className="transition-all duration-300 focus:shadow-[0_0_0_3px_#2A6DFF44] focus:border-[#2A6DFF]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="********"
                                  {...field}
                                  className="transition-all duration-300 focus:shadow-[0_0_0_3px_#2A6DFF44] focus:border-[#2A6DFF]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="agreeTerms"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-normal">
                                  I agree to the {" "}
                                  <Button
                                    type="button"
                                    variant="link"
                                    className="p-0 h-auto text-sm text-[#2A6DFF] hover:underline"
                                    onClick={() => setPrivacyOpen(true)}
                                  >
                                    Terms
                                  </Button>{" "}
                                  and {" "}
                                  <Button
                                    type="button"
                                    variant="link"
                                    className="p-0 h-auto text-sm text-[#2A6DFF] hover:underline"
                                    onClick={() => setPrivacyOpen(true)}
                                  >
                                    Privacy Policy
                                  </Button>
                                </FormLabel>
                                <FormMessage />
                              </div>
                              <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
                                <DialogContent className="max-w-xl">
                                  <DialogHeader>
                                    <DialogTitle>Privacy Policy & Notice</DialogTitle>
                                    <DialogDescription>
                                      <div className="text-left space-y-4 mt-2">
                                        <p>
                                          <span className="font-semibold text-[#2A6DFF]">QuantumFit AI</span> is committed to protecting your privacy and personal data. We will never sell, misuse, or share your information with third parties for advertising or malicious purposes.
                                        </p>
                                        <ul className="list-disc pl-5 space-y-2">
                                          <li>
                                            <span className="font-semibold">Purpose of Data:</span> We only use your data to provide and improve your fitness experience on QuantumFit AI.
                                          </li>
                                          <li>
                                            <span className="font-semibold">Email Notifications:</span> You may receive emails about your daily water intake, daily goals, or important account updates. No marketing or spam.
                                          </li>
                                          <li>
                                            <span className="font-semibold">No Bad Use:</span> We do not use your data for any harmful, unethical, or unauthorized activities.
                                          </li>
                                          <li>
                                            <span className="font-semibold">Security:</span> Your data is stored securely and only accessible to you and authorized system processes.
                                          </li>
                                          <li>
                                            <span className="font-semibold">Transparency:</span> You can request to view or delete your data at any time by contacting support.
                                          </li>
                                        </ul>
                                        <p>
                                          By using QuantumFit AI, you consent to this privacy policy. For any questions, contact our support team.
                                        </p>
                                      </div>
                                    </DialogDescription>
                                  </DialogHeader>
                                </DialogContent>
                              </Dialog>
                            </FormItem>
                          )}
                        />
                        <motion.button
                          type="submit"
                          className="w-full bg-[#2A6DFF] hover:bg-[#1e56cc] text-white font-semibold py-3 rounded-full shadow-lg transition-transform duration-200 active:scale-95"
                          disabled={registerMutation.isPending}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                        </motion.button>
                      </form>
                    </Form>
                  </CardContent>
                </motion.div>
              </TabsContent>
            )}
          </AnimatePresence>
        </Tabs>
      </Card>
    </motion.div>
  );
}
