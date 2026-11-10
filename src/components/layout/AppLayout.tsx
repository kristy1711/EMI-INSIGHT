'use client';

import Link from 'next/link';
import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  Users,
  Rss,
  Radar,
  BrainCircuit,
  LayoutDashboard,
  Search,
  FileBarChart,
  History,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from './AuthGuard';
import { Badge } from '@/components/ui/badge';
import { ROL_LABEL, type Rol } from '@/types';

interface MenuItem {
  href: string;
  etiqueta: string;
  icono: typeof Users;
  roles: Rol[];
}

const GRUPOS: { titulo: string; items: MenuItem[] }[] = [
  {
    titulo: 'Gestión de Usuarios',
    items: [
      {
        href: '/usuarios',
        etiqueta: 'Usuarios',
        icono: Users,
        roles: ['superadministrador'],
      },
    ],
  },
  {
    titulo: 'Fuentes y Recopilación',
    items: [
      {
        href: '/fuentes',
        etiqueta: 'Fuentes',
        icono: Rss,
        roles: ['superadministrador', 'administrador'],
      },
      {
        href: '/scraping',
        etiqueta: 'Recopilación (Scraping)',
        icono: Radar,
        roles: ['superadministrador', 'administrador'],
      },
    ],
  },
  {
    titulo: 'Procesamiento PLN',
    items: [
      {
        href: '/pln',
        etiqueta: 'Análisis PLN',
        icono: BrainCircuit,
        roles: ['superadministrador', 'administrador'],
      },
    ],
  },
  {
    titulo: 'Informes y Reportes',
    items: [
      {
        href: '/dashboard',
        etiqueta: 'Dashboard',
        icono: LayoutDashboard,
        roles: ['superadministrador', 'administrador', 'usuario'],
      },
      {
        href: '/buscar',
        etiqueta: 'Buscar y filtrar',
        icono: Search,
        roles: ['superadministrador', 'administrador', 'usuario'],
      },
      {
        href: '/reportes',
        etiqueta: 'Reportes',
        icono: FileBarChart,
        roles: ['superadministrador', 'administrador', 'usuario'],
      },
      {
        href: '/historial',
        etiqueta: 'Historial',
        icono: History,
        roles: ['superadministrador', 'administrador', 'usuario'],
      },
    ],
  },
];

const rolBadgeClass: Record<Rol, string> = {
  superadministrador: 'bg-gold/20 text-gold border-gold/40',
  administrador: 'bg-emiblue/20 text-blue-200 border-emiblue/40',
  usuario: 'bg-white/10 text-white/80 border-white/20',
};

function SidebarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, logout } = useAuth();

  function onLogout() {
    logout();
    toast.success('Sesión cerrada correctamente');
    router.push('/login');
  }

  if (!usuario) return null;

  return (
    <div className="flex h-full flex-col bg-navy text-white">
      {/* Logo y nombre */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
          <Shield className="h-6 w-6 text-gold" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-bold tracking-tight">
            PercepciónEMI
          </p>
          <p className="truncate text-xs text-white/60">EMI-UALP, Bolivia</p>
        </div>
      </div>

      {/* Tarjeta de usuario */}
      <div className="mx-4 mt-4 rounded-xl bg-white/5 p-3 border border-white/10">
        <p className="truncate text-sm font-semibold">{usuario.nombre}</p>
        <p className="truncate text-xs text-white/60">{usuario.cargo}</p>
        <Badge
          variant="outline"
          className={`mt-2 border ${rolBadgeClass[usuario.rol]} text-[11px]`}
        >
          {ROL_LABEL[usuario.rol]}
        </Badge>
      </div>

      {/* Menú agrupado */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {GRUPOS.map((grupo) => {
          const items = grupo.items.filter((i) => i.roles.includes(usuario.rol));
          if (items.length === 0) return null;
          return (
            <div key={grupo.titulo} className="mb-4">
              <p className="px-4 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                {grupo.titulo}
              </p>
              {items.map((item) => {
                const activo = pathname.startsWith(item.href);
                const Icono = item.icono;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-item ${activo ? 'active' : ''} flex items-center gap-3 rounded-r-lg px-4 py-2.5 text-sm text-white/70`}
                  >
                    <Icono className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.etiqueta}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Cerrar sesión */}
      <div className="border-t border-white/10 p-4">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        {/* Sidebar fijo en escritorio */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 md:block">
          <SidebarContent />
        </aside>
        {/* Sidebar inferior en tablet/móvil */}
        <div className="md:hidden">
          <SidebarContent />
        </div>
        <main className="flex-1 md:ml-64">
          <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
