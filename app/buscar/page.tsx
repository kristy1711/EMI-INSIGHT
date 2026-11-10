'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Search } from 'lucide-react';

export default function BuscarPage() {
  return (
    <AppLayout>
      <PageHeader
        titulo="Buscar y filtrar"
        subtitulo="Explore las menciones recopiladas aplicando filtros por fecha, red y sentimiento."
      />
      <div className="emi-empty emi-card">
        <Search className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm font-medium">Módulo en construcción</p>
        <p className="mt-1 text-xs">
          Aquí podrá buscar menciones y filtrarlas por sentimiento, red social y rango de fechas.
        </p>
      </div>
    </AppLayout>
  );
}
