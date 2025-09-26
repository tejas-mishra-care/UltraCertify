
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import { AppHeader } from '@/components/app-header';


export const metadata: Metadata = {
  title: 'UltraTech shashwat GREEN HOME CERTIFICATION',
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
