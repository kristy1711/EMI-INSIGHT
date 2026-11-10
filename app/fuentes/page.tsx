'use client';

import { AuthGuard } from '@/components/layout/AuthGuard';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import ListadoFuentesTab from '@/components/fuentes/ListadoFuentesTab';
import NuevaFuenteTab from '@/components/fuentes/NuevaFuenteTab';
import { ShieldAlert } from 'lucide-react';
import type { Rol } from '@/types';

const ROLES_PERMITIDOS: Rol[] = ['superadministrador', 'administrador'];

export default function FuentesPage() {
  return (
    <AppLayout>
      <AuthGuard permitidos={ROLES_PERMITIDOS}>
        <FuentesPageInner />
      </AuthGuard>
    </AppLayout>
  );
}

function FuentesPageInner() {
  const { rol, cargando: cargandoAuth } = useAuth();

  if (cargandoAuth) return null;

  if (!rol || !ROLES_PERMITIDOS.includes(rol)) {
    return (
      <div className="emi-empty emi-card">
        <ShieldAlert className="mb-3 h-10 w-10 text-destructive/50" />
        <p className="text-sm font-medium text-navy">Acceso restringido</p>
        <p className="mt-1 text-xs">
          Este módulo está disponible para Superadministrador y Administrador.
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        titulo="Fuentes Configuradas"
        subtitulo="Administre las cuentas y páginas de donde se recopilan las menciones."
      />
      <Tabs defaultValue="listado" className="space-y-6">
        <TabsList className="h-auto rounded-xl border border-border bg-white p-1 shadow-sm">
          <TabsTrigger
            value="listado"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-navy data-[state=active]:text-white"
          >
            Fuentes configuradas
          </TabsTrigger>
          <TabsTrigger
            value="nueva"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-navy data-[state=active]:text-white"
          >
            Nueva fuente
          </TabsTrigger>
        </TabsList>
        <TabsContent value="listado">
          <ListadoFuentesTab />
        </TabsContent>
        <TabsContent value="nueva">
          <NuevaFuenteTab />
        </TabsContent>
      </Tabs>
    </>
  );
}
