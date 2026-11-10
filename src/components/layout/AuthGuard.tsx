'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function AuthGuard({
  children,
  permitidos,
}: {
  children: ReactNode;
  permitidos?: string[];
}) {
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!cargando && !usuario) {
      router.replace('/login');
    }
  }, [cargando, usuario, router]);

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-sm space-y-4 p-8">
          <div className="emi-skeleton h-10 w-2/3 mx-auto" />
          <div className="emi-skeleton h-4 w-full" />
          <div className="emi-skeleton h-4 w-5/6 mx-auto" />
        </div>
      </div>
    );
  }

  if (!usuario) return null;

  return <>{children}</>;
}
