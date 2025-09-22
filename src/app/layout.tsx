import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CircleUser } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'UltraCertify',
  description: 'Green Building Certification Tool',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-secondary/50">
        <main id="main-content" className="min-h-screen p-2 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Image src="/ultratech-logo.png" alt="UltraTech Logo" width={200} height={69} priority />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end text-right">
                            <span className="font-semibold text-lg text-primary">UltraCertify</span>
                            <p className="text-sm text-muted-foreground">IGBC's NEST PLUS Ver 1.0 - Green Home Certification</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                <Avatar>
                                <AvatarImage src="https://picsum.photos/seed/user/100/100" />
                                <AvatarFallback>
                                    <CircleUser />
                                </AvatarFallback>
                                </Avatar>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href="/profile" passHref>
                                <DropdownMenuItem>Profile</DropdownMenuItem>
                            </Link>
                            <Link href="/drafts" passHref>
                                <DropdownMenuItem>My Drafts</DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                             <Link href="/login" passHref>
                                <DropdownMenuItem>Logout</DropdownMenuItem>
                            </Link>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                {children}
            </div>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
