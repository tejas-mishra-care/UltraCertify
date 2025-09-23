
'use client';

import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';

export const AppHeader = () => {
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
