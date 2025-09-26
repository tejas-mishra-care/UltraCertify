
'use client';

import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const AppHeader = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="flex flex-row justify-between items-center gap-4 bg-accent p-4 rounded-lg shadow-sm relative">
      <div className="w-1/3 flex justify-start">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={33}
            priority
            className="cursor-pointer object-contain"
          />
        </Link>
      </div>
      
      <div className="w-1/3 flex justify-center">
        <Image
            src="/shashwat.png"
            alt="Shashwat Logo"
            width={150}
            height={50}
            priority
            className="object-contain"
          />
      </div>

      <div className="w-1/3 flex justify-end items-center gap-4">
        <Image
            src="/utec.jpeg"
            alt="UTEC Logo"
            width={100}
            height={33}
            priority
            className="object-contain"
        />
        {!loading && user && (
           <div className="absolute top-4 right-4 md:static">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Open user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   <DropdownMenuItem asChild>
                    <Link href="/">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                     <LogOut className="mr-2 h-4 w-4" />
                     <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
           </div>
        )}
      </div>
    </header>
  );
};
