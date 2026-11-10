'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { History } from 'lucide-react';

export default function HistorialPage() {
  return (
    <AppLayout>
      <PageHeader
        titulo="Historial"
        subtitulo="Revise el registro de actividad y las consultas realizadas en el sistema."
      />
      <div className="emi-empty emi-card">
        <History className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm font-medium">Módulo en construcción</p>
        <p className="mt-1 text-xs">
          Aquí podrá ver el historial de recopilaciones, análisis y reportes generados.
        </p>
      </div>
    </AppLayout>
  );
}
