'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  Search,
  FileBarChart,
  History,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { getAnalisisConsolidado } from '@/services/analisis.service';

const ACCESOS = [
  {
    href: '/dashboard',
    titulo: 'Consultar Dashboard',
    descripcion: 'Indicadores visuales de percepción institucional por polaridad y factor.',
    icono: LayoutDashboard,
    color: '#0b2545',
  },
  {
    href: '/buscar',
    titulo: 'Buscar y Filtrar',
    descripcion: 'Explore el corpus de opiniones con filtros avanzados y sin identificar autores.',
    icono: Search,
    color: '#1f6feb',
  },
  {
    href: '/reportes',
    titulo: 'Generar Reportes',
    descripcion: 'Cree documentos PDF o CSV con diseño institucional y secciones a medida.',
    icono: FileBarChart,
    color: '#2e9e6b',
  },
  {
    href: '/historial',
    titulo: 'Gestionar Historial',
    descripcion: 'Revise, descargue o elimine los reportes generados anteriormente.',
    icono: History,
    color: '#c9a227',
  },
];

export default function InformesPage() {
  const analisis = getAnalisisConsolidado();
  const r = analisis.resultados;

  return (
    <AppLayout>
      <PageHeader
        titulo="Informes y Reportes"
        subtitulo="Punto de partida para consultar, explorar y generar reportes de percepción institucional."
      />

      {/* Caja informativa con resumen del análisis disponible */}
      <div
        className="emi-card mb-8 flex flex-col gap-4 border-l-4 p-6 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderLeftColor: '#1f6feb' }}
      >
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-emiblue" />
          <div>
            <h2 className="text-base font-semibold text-navy">
              Análisis PLN disponible
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Datos generados el{' '}
              {new Date(r.generadoEn).toLocaleDateString('es-BO', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}{' '}
              sobre {r.corpus.validos} opiniones válidas.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="border-transparent bg-[#2e9e6b]/15 text-[#2e9e6b]">
            Positivas {r.sentimientos.positivo}%
          </Badge>
          <Badge className="border-transparent bg-[#e0a100]/15 text-[#e0a100]">
            Neutrales {r.sentimientos.neutral}%
          </Badge>
          <Badge className="border-transparent bg-[#d64545]/15 text-[#d64545]">
            Negativas {r.sentimientos.negativo}%
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {ACCESOS.map((a) => {
          const Icono = a.icono;
          return (
            <Link
              key={a.href}
              href={a.href}
              className="emi-card group p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: a.color }}
                >
                  <Icono className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-emiblue" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-navy">{a.titulo}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {a.descripcion}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Resumen rápido de factores */}
      <div className="emi-card mt-8 p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emiblue" />
          <h2 className="text-base font-semibold text-navy">
            Factores de percepción identificados
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {r.factores.map((f) => (
            <div
              key={f.nombre}
              className="flex items-center justify-between rounded-xl border border-border p-4"
            >
              <div>
                <p className="text-sm font-semibold text-navy">{f.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {f.cantidad} opiniones negativas
                </p>
              </div>
              <span className="text-lg font-bold text-emiblue">{f.porcentaje}%</span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
