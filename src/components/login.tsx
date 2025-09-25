
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const signupSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const { toast } = useToast();

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  });
  
  const handleAuthError = (error: unknown) => {
    let description = "An unexpected error occurred. Please try again later.";
    if (error instanceof FirebaseError) {
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                description = "The email or password you entered is incorrect. Please check your credentials and try again.";
                break;
            case 'auth/email-already-in-use':
                description = "An account with this email address already exists. Please log in or use a different email.";
                break;
            case 'auth/weak-password':
                description = "The password is too weak. Please choose a password that is at least 6 characters long.";
                break;
            case 'auth/invalid-email':
                description = "The email address is not valid. Please enter a valid email.";
                break;
            case 'auth/too-many-requests':
                 description = "Access to this account has been temporarily disabled due to many failed login attempts. You can reset your password or try again later.";
                 break;
            default:
                 console.error("Firebase Auth Error:", error.code, error.message);
                 break;
        }
    } else {
        console.error("Non-Firebase Error:", error);
    }
     toast({
        variant: "destructive",
        title: "Authentication Failed",
        description,
    });
  }

  const onLogin = async (data: LoginValues) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast({ title: "Login Successful", description: "Welcome back!" });
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const onSignup = async (data: SignupValues) => {
    setLoading(true);
    try {
      await signup(data.email, data.password);
      toast({ title: "Signup Successful", description: "Welcome to UltraCertify!" });
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Enter your credentials to access your projects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="m@example.com"
                    {...loginRegister('email')}
                  />
                  {loginErrors.email && (
                    <p className="text-sm text-destructive">{loginErrors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" {...loginRegister('password')} />
                   {loginErrors.password && (
                    <p className="text-sm text-destructive">{loginErrors.password.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>
                Create an account to start managing your certifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="m@example.com"
                    {...signupRegister('email')}
                  />
                   {signupErrors.email && (
                    <p className="text-sm text-destructive">{signupErrors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" {...signupRegister('password')} />
                  {signupErrors.password && (
                    <p className="text-sm text-destructive">{signupErrors.password.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Login;
