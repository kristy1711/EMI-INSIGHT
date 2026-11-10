'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import ListadoTab from '@/components/usuarios/ListadoTab';
import CrearTab from '@/components/usuarios/CrearTab';
import EditarTab from '@/components/usuarios/EditarTab';
import { ShieldAlert } from 'lucide-react';

function SoloSuperAdmin({ children }: { children: React.ReactNode }) {
  const { rol, cargando } = useAuth();

  if (cargando) return null;

  if (rol !== 'superadministrador') {
    return (
      <div className="emi-empty emi-card">
        <ShieldAlert className="mb-3 h-10 w-10 text-destructive/50" />
        <p className="text-sm font-medium text-navy">Acceso restringido</p>
        <p className="mt-1 text-xs">
          Este módulo está disponible únicamente para el Superadministrador.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

export default function UsuariosPage() {
  return (
    <AppLayout>
      <AuthGuard permitidos={['superadministrador']}>
        <SoloSuperAdmin>
          <PageHeader
            titulo="Gestión de Usuarios"
            subtitulo="Administre las cuentas que acceden al sistema, sus roles y estados."
          />
          <Tabs defaultValue="listado" className="space-y-6">
            <TabsList className="bg-white shadow-sm border border-border rounded-xl p-1 h-auto">
              <TabsTrigger
                value="listado"
                className="rounded-lg px-4 py-2 data-[state=active]:bg-navy data-[state=active]:text-white"
              >
                Listado
              </TabsTrigger>
              <TabsTrigger
                value="crear"
                className="rounded-lg px-4 py-2 data-[state=active]:bg-navy data-[state=active]:text-white"
              >
                Crear usuario
              </TabsTrigger>
              <TabsTrigger
                value="editar"
                className="rounded-lg px-4 py-2 data-[state=active]:bg-navy data-[state=active]:text-white"
              >
                Editar / Modificar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="listado">
              <ListadoTab />
            </TabsContent>
            <TabsContent value="crear">
              <CrearTab />
            </TabsContent>
            <TabsContent value="editar">
              <EditarTab />
            </TabsContent>
          </Tabs>
        </SoloSuperAdmin>
      </AuthGuard>
    </AppLayout>
  );
}
