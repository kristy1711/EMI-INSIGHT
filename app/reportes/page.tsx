'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { FileBarChart } from 'lucide-react';

export default function ReportesPage() {
  return (
    <AppLayout>
      <PageHeader
        titulo="Reportes"
        subtitulo="Genere, descargue y consulte informes de percepción institucional."
      />
      <div className="emi-empty emi-card">
        <FileBarChart className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm font-medium">Módulo en construcción</p>
        <p className="mt-1 text-xs">
          Aquí podrá generar reportes periódicos y exportarlos en distintos formatos.
        </p>
      </div>
    </AppLayout>
  );
}
