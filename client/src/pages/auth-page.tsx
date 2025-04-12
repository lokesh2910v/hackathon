import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, loginUserSchema, InsertUser, LoginUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  
  // If user is already logged in, redirect to home
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="hidden md:block p-6">
          <div className="mb-8">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.611L5 14.5" />
              </svg>
              <h1 className="text-2xl font-bold">Aptos Quiz Platform</h1>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
            Test Your Blockchain Knowledge & Earn APT
          </h2>
          
          <p className="text-gray-600 mb-6">
            Take quizzes on various blockchain topics, test your knowledge, and earn APT tokens for successful quiz completions.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                <span className="text-primary-600 text-sm font-bold">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Take Quizzes</h3>
                <p className="text-sm text-gray-500">Choose from a variety of blockchain-related topics and test your knowledge.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                <span className="text-primary-600 text-sm font-bold">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Earn Rewards</h3>
                <p className="text-sm text-gray-500">Receive APT tokens based on your quiz performance.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                <span className="text-primary-600 text-sm font-bold">3</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Connect Wallet</h3>
                <p className="text-sm text-gray-500">Link your Aptos wallet to collect your earned tokens.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Auth Forms */}
        <div>
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-center">Welcome to Aptos Quiz</CardTitle>
              <CardDescription className="text-center">
                {tab === "login" 
                  ? "Sign in to your account to continue" 
                  : "Create an account to get started"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={tab} onValueChange={(val) => setTab(val as "login" | "register")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <LoginForm />
                </TabsContent>
                
                <TabsContent value="register">
                  <RegisterForm />
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-2">
              <div className="text-sm text-gray-500 text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { loginMutation } = useAuth();
  
  const form = useForm<LoginUser>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  function onSubmit(values: LoginUser) {
    loginMutation.mutate(values);
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter your username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>
    </Form>
  );
}

function RegisterForm() {
  const { registerMutation } = useAuth();
  
  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  function onSubmit(values: InsertUser) {
    registerMutation.mutate(values);
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Choose a username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Create a password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirm your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>
    </Form>
  );
}
