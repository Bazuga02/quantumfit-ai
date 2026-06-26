import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Eye, EyeOff, UserRound } from "lucide-react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Extended schema for login
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
  const { loginMutation, registerMutation, guestLoginMutation } = useAuth();
  const [, navigate] = useLocation();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegisterPw, setShowRegisterPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
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

  function onGuestLogin() {
    guestLoginMutation.mutate(undefined, { onSuccess: () => navigate("/") });
  }

  const isAuthPending =
    loginMutation.isPending || registerMutation.isPending || guestLoginMutation.isPending;

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
                    ? "bg-white dark:bg-gray-950 text-[#FF3A54] dark:text-[#FF3A54] shadow-[0_2px_16px_0_#FF3A5422] font-bold z-10 transition-all duration-200 border-2 border-[#FF3A54] dark:border-[#FF3A54]"
                    : "bg-transparent text-gray-500 dark:text-gray-300 font-semibold transition-all duration-200"
                }
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className={
                  activeTab === "register"
                    ? "bg-white dark:bg-gray-950 text-[#FF3A54] dark:text-[#FF3A54] shadow-[0_2px_16px_0_#FF3A5422] font-bold z-10 transition-all duration-200 border-2 border-[#FF3A54] dark:border-[#FF3A54]"
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
                                  className="transition-all duration-300 focus:shadow-[0_0_0_3px_#FF3A5444] focus:border-[#FF3A54]"
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
                                <div className="relative">
                                  <Input
                                    type={showLoginPw ? "text" : "password"}
                                    placeholder="********"
                                    {...field}
                                    className="transition-all duration-300 focus:shadow-[0_0_0_3px_#FF3A5444] focus:border-[#FF3A54] pr-10"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowLoginPw((p) => !p)}
                                    aria-label={showLoginPw ? "Hide password" : "Show password"}
                                  >
                                    {showLoginPw ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end">
                          <Button variant="link" className="p-0 h-auto text-sm text-[#FF3A54] hover:underline">Forgot password?</Button>
                        </div>
                        <motion.button
                          type="submit"
                          className="w-full bg-[#FF3A54] hover:bg-[#e63346] text-white font-semibold py-3 rounded-full shadow-lg transition-transform duration-200 active:scale-95"
                          disabled={isAuthPending}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {loginMutation.isPending ? "Signing in..." : "Sign in"}
                        </motion.button>
                      </form>
                    </Form>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-gray-950 px-3 text-gray-400 font-medium tracking-wider">
                          or
                        </span>
                      </div>
                    </div>

                    <motion.button
                      type="button"
                      onClick={onGuestLogin}
                      disabled={isAuthPending}
                      className="group w-full flex items-center justify-center gap-2.5 rounded-full border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/50 px-4 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all duration-200 hover:border-[#FF3A54]/50 hover:bg-[#FF3A54]/5 hover:text-[#FF3A54] disabled:opacity-60 disabled:cursor-not-allowed"
                      whileHover={{ scale: isAuthPending ? 1 : 1.02 }}
                      whileTap={{ scale: isAuthPending ? 1 : 0.98 }}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 group-hover:ring-[#FF3A54]/30 transition-all">
                        <UserRound className="h-4 w-4 text-[#FF3A54]" />
                      </span>
                      <span className="flex flex-col items-start text-left">
                        <span>
                          {guestLoginMutation.isPending ? "Entering as guest..." : "Continue as Guest"}
                        </span>
                        <span className="text-xs font-normal text-gray-400 group-hover:text-[#FF3A54]/70 transition-colors">
                          No signup required — explore the app
                        </span>
                      </span>
                    </motion.button>
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
                                  className="transition-all duration-300 focus:shadow-[0_0_0_3px_#FF3A5444] focus:border-[#FF3A54]"
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
                                  className="transition-all duration-300 focus:shadow-[0_0_0_3px_#FF3A5444] focus:border-[#FF3A54]"
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
                                <div className="relative">
                                  <Input
                                    type={showRegisterPw ? "text" : "password"}
                                    placeholder="********"
                                    {...field}
                                    className="transition-all duration-300 focus:shadow-[0_0_0_3px_#FF3A5444] focus:border-[#FF3A54] pr-10"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowRegisterPw((p) => !p)}
                                    aria-label={showRegisterPw ? "Hide password" : "Show password"}
                                  >
                                    {showRegisterPw ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                                  </Button>
                                </div>
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
                                <div className="relative">
                                  <Input
                                    type={showConfirmPw ? "text" : "password"}
                                    placeholder="********"
                                    {...field}
                                    className="transition-all duration-300 focus:shadow-[0_0_0_3px_#FF3A5444] focus:border-[#FF3A54] pr-10"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowConfirmPw((p) => !p)}
                                    aria-label={showConfirmPw ? "Hide password" : "Show password"}
                                  >
                                    {showConfirmPw ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                                  </Button>
                                </div>
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
                                    className="p-0 h-auto text-sm text-[#FF3A54] hover:underline"
                                    onClick={() => setPrivacyOpen(true)}
                                  >
                                    Terms
                                  </Button>{" "}
                                  and {" "}
                                  <Button
                                    type="button"
                                    variant="link"
                                    className="p-0 h-auto text-sm text-[#FF3A54] hover:underline"
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
                                          <span className="font-semibold text-[#FF3A54]">QuantumFit AI</span> is committed to protecting your privacy and personal data. We will never sell, misuse, or share your information with third parties for advertising or malicious purposes.
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
                          className="w-full bg-[#FF3A54] hover:bg-[#e63346] text-white font-semibold py-3 rounded-full shadow-lg transition-transform duration-200 active:scale-95"
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
