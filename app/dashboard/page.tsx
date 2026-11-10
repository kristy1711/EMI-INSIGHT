'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  getIndicadores,
  getMencionesPorDia,
  getDistribucionPorRed,
  type IndicadoresGenerales,
  type MencionPorDia,
  type Redistribucion,
} from '@/services/reportes.service';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  MessageSquare,
  SmilePlus,
  MinusCircle,
  Frown,
  TrendingUp,
  Loader2,
} from 'lucide-react';

const COLORES_SENTIMIENTO = {
  positivo: '#2e9e6b',
  neutral: '#e0a100',
  negativo: '#d64545',
};

const tooltipStyle = {
  borderRadius: '0.75rem',
  border: '1px solid #e8edf5',
  boxShadow: '0 8px 24px rgba(11, 37, 69, 0.12)',
  fontSize: '0.8rem',
};

export default function DashboardPage() {
  const [cargando, setCargando] = useState(true);
  const [indicadores, setIndicadores] = useState<IndicadoresGenerales | null>(null);
  const [serie, setSerie] = useState<MencionPorDia[]>([]);
  const [redes, setRedes] = useState<Redistribucion[]>([]);

  useEffect(() => {
    Promise.all([getIndicadores(), getMencionesPorDia(), getDistribucionPorRed()])
      .then(([ind, serieData, redesData]) => {
        setIndicadores(ind);
        setSerie(serieData);
        setRedes(redesData);
      })
      .finally(() => setCargando(false));
  }, []);

  const totalSentimiento = indicadores
    ? indicadores.sentimientoPositivo +
      indicadores.sentimientoNeutral +
      indicadores.sentimientoNegativo
    : 0;
  const pastelData = indicadores
    ? [
        { nombre: 'Positivo', valor: indicadores.sentimientoPositivo },
        { nombre: 'Neutral', valor: indicadores.sentimientoNeutral },
        { nombre: 'Negativo', valor: indicadores.sentimientoNegativo },
      ]
    : [];

  return (
    <AppLayout>
      <PageHeader
        titulo="Dashboard"
        subtitulo="Panorama general de la percepción institucional en redes sociales."
      />

      {cargando ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emiblue" />
        </div>
      ) : (
        <>
          {/* Tarjetas de indicadores */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="emi-card flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emiblue/10">
                <MessageSquare className="h-5 w-5 text-emiblue" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Menciones totales
                </p>
                <p className="text-2xl font-bold text-navy">
                  {indicadores?.mencionesTotales.toLocaleString('es-BO')}
                </p>
              </div>
            </div>
            <div className="emi-card flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#2e9e6b]/10">
                <SmilePlus className="h-5 w-5 text-[#2e9e6b]" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Positivo
                </p>
                <p className="text-2xl font-bold text-[#2e9e6b]">
                  {indicadores?.sentimientoPositivo}%
                </p>
              </div>
            </div>
            <div className="emi-card flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e0a100]/10">
                <MinusCircle className="h-5 w-5 text-[#e0a100]" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Neutral
                </p>
                <p className="text-2xl font-bold text-[#e0a100]">
                  {indicadores?.sentimientoNeutral}%
                </p>
              </div>
            </div>
            <div className="emi-card flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#d64545]/10">
                <Frown className="h-5 w-5 text-[#d64545]" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Negativo
                </p>
                <p className="text-2xl font-bold text-[#d64545]">
                  {indicadores?.sentimientoNegativo}%
                </p>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="emi-card p-5 xl:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-navy">
                  Menciones por sentimiento — últimos 7 días
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#2e9e6b]/10 px-2.5 py-1 text-xs font-semibold text-[#2e9e6b]">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +{indicadores?.variacionSemanal}%
                </span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={serie} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gPos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORES_SENTIMIENTO.positivo} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={COLORES_SENTIMIENTO.positivo} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gNeu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORES_SENTIMIENTO.neutral} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={COLORES_SENTIMIENTO.neutral} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gNeg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORES_SENTIMIENTO.negativo} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={COLORES_SENTIMIENTO.negativo} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" vertical={false} />
                  <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: '#5a6a80' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#5a6a80' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '0.8rem' }} />
                  <Area type="monotone" dataKey="positivo" name="Positivo" stroke={COLORES_SENTIMIENTO.positivo} strokeWidth={2} fill="url(#gPos)" />
                  <Area type="monotone" dataKey="neutral" name="Neutral" stroke={COLORES_SENTIMIENTO.neutral} strokeWidth={2} fill="url(#gNeu)" />
                  <Area type="monotone" dataKey="negativo" name="Negativo" stroke={COLORES_SENTIMIENTO.negativo} strokeWidth={2} fill="url(#gNeg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="emi-card p-5">
              <h2 className="mb-4 text-base font-semibold text-navy">
                Distribución de sentimiento
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pastelData}
                    dataKey="valor"
                    nameKey="nombre"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {pastelData.map((entry, i) => (
                      <Cell
                        key={entry.nombre}
                        fill={Object.values(COLORES_SENTIMIENTO)[i]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number, name: string) => [
                      `${value}% (de ${totalSentimiento})`,
                      name,
                    ]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '0.8rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="emi-card mt-6 p-5">
            <h2 className="mb-4 text-base font-semibold text-navy">
              Menciones por red social
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={redes} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" vertical={false} />
                <XAxis dataKey="red" tick={{ fontSize: 12, fill: '#5a6a80' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#5a6a80' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="menciones" name="Menciones" fill="#1f6feb" radius={[8, 8, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </AppLayout>
  );
}
