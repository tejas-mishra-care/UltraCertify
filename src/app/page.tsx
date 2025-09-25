
"use client";

import React from "react";
import dynamic from 'next/dynamic';
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const LoginPage = dynamic(() => import('@/app/login/page'));

const DashboardPage = () => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = React.useState(false);

  // In a real app, you would fetch projects from Firestore here
  const projects: any[] = []; 

  const handleNewProject = () => {
    setIsNavigating(true);
    // This will navigate to a new page for creating a project
    // For now, let's assume it's `/certification`
    router.push('/certification');
  };

  return (
     <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Your Projects</h1>
            <Button onClick={handleNewProject} disabled={isNavigating}>
                {isNavigating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                {isNavigating ? 'Loading...' : 'New Project'}
            </Button>
        </div>

        {projects.length === 0 ? (
            <Card className="text-center py-12">
                <CardHeader>
                    <CardTitle>No Projects Yet</CardTitle>
                    <CardDescription>Get started by creating your first green building certification project.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleNewProject} disabled={isNavigating}>
                         {isNavigating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                         {isNavigating ? 'Loading...' : 'Create Your First Project'}
                    </Button>
                </CardContent>
            </Card>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* This is where project cards would be mapped and displayed */}
            </div>
        )}
    </div>
  );
};


const HomePage: React.FC = () => {
  const { user, loading } = useAuth();

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

  return <DashboardPage />;
};

export default HomePage;
