
"use client";

import React from "react";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import LoginPage from '@/app/login/page';

const HomePage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && user) {
      // If user is logged in, redirect them to the main task page.
      router.replace('/certification');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Render a loader while redirecting
  return (
    <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
};

export default HomePage;
