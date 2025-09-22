
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Mail, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
    const router = useRouter();
    const { toast } = useToast();

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Profile Updated",
            description: "Your profile information has been saved.",
        });
    }

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">User Profile</CardTitle>
          <CardDescription>
            View and manage your account details.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdate}>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" defaultValue="Jane Doe" required className="pl-9" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" defaultValue="jane.doe@example.com" required className="pl-9" />
              </div>
            </div>
            <Button type="submit" className="w-full">Update Profile</Button>
            <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="w-full" onClick={() => router.push('/drafts')}>
                    <ArrowLeft /> Back to Drafts
                </Button>
                <Button variant="destructive" className="w-full" onClick={() => router.push('/login')}>
                    <LogOut /> Logout
                </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
