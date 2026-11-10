'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!cargando) {
      router.replace(usuario ? '/dashboard' : '/login');
    }
  }, [cargando, usuario, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="emi-skeleton h-8 w-48" />
    </div>
  );
}
