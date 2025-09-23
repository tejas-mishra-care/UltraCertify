import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Image from 'next/image';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'UltraCertify',
  description: 'Green Building Certification Tool',
};

const AppHeader = () => {
  const { user, loading, logout } = useAuth();

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-accent p-4 rounded-lg shadow-sm">
      <Image
        src="/ultratech-logo.png"
        alt="UltraTech Logo"
        width={200}
        height={69}
        priority
      />
      <div className="flex flex-col items-end text-right">
        <span className="font-semibold text-lg text-accent-foreground">
          UltraCertify
        </span>
        <p className="text-sm text-accent-foreground/80">
          IGBC's NEST & NEST PLUS - Green Home Certification
        </p>
      </div>
      {!loading && user && (
         <Button onClick={logout} variant="outline" size="sm" className="absolute top-6 right-6">Logout</Button>
      )}
    </header>
  );
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
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://plus.google.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-secondary/50">
       <AuthProvider>
          <div className="max-w-7xl mx-auto p-2 sm:p-6 lg:p-8">
              <AppHeader />
              <main id="main-content" className="mt-8">
                  {children}
              </main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
