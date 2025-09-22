import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import Image from "next/image";

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
      <body className="antialiased bg-secondary/50">
        <div className="max-w-7xl mx-auto p-2 sm:p-6 lg:p-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-4">
                    <Image src="/ultratech-logo.png" alt="UltraTech Logo" width={200} height={69} priority />
                </div>
                <div className="flex flex-col items-end text-right">
                    <span className="font-semibold text-lg text-primary">UltraCertify</span>
                    <p className="text-sm text-muted-foreground">IGBC's NEST PLUS Ver 1.0 - Green Home Certification</p>
                </div>
            </header>
            <main id="main-content" className="mt-8">
                {children}
            </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
