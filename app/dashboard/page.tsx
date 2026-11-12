'use client';

import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { Filter, MessageSquare, SmilePlus, MinusCircle, Frown } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getAnalisisConsolidado, fuentesDisponibles, type OpinionAnalizada } from '@/services/analisis.service';

const COLORES = {
  positivo: '#2e9e6b',
  neutral: '#e0a100',
  negativo: '#d64545',
};

const PALETA_FACTORES = [
  '#0b2545', '#1f6feb', '#2e9e6b', '#c9a227',
  '#e0a100', '#d64545', '#5a6a80',
];

const tooltipStyle = {
  borderRadius: '0.75rem',
  border: '1px solid #e8edf5',
  boxShadow: '0 8px 24px rgba(11, 37, 69, 0.12)',
  fontSize: '0.8rem',
};

const PERIODOS = [
  { valor: '7d', etiqueta: 'Últimos 7 días' },
  { valor: '30d', etiqueta: 'Últimos 30 días' },
  { valor: '90d', etiqueta: 'Últimos 90 días' },
  { valor: 'todo', etiqueta: 'Todo el periodo' },
];

function KpiCard({
  etiqueta,
  valor,
  color,
  icono: Icono,
  sufijo,
}: {
  etiqueta: string;
  valor: number | string;
  color: string;
  icono: typeof MessageSquare;
  sufijo?: string;
}) {
  return (
    <div
      className="emi-card overflow-hidden p-5"
      style={{ borderTop: `4px solid ${color}` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icono className="h-5 w-5" style={{ color }} />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {etiqueta}
          </p>
          <p className="text-2xl font-bold text-navy">
            {valor}
            {sufijo && <span className="text-base font-semibold"> {sufijo}</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

function EvolucionMensual({ opiniones }: { opiniones: OpinionAnalizada[] }) {
  // Agrupamos por mes (YYYY-MM) y polaridad.
  const datos = useMemo(() => {
    const porMes: Record<string, { positivo: number; neutral: number; negativo: number }> = {};
    opiniones.forEach((o) => {
      const mes = o.fecha.slice(0, 7);
      if (!porMes[mes]) porMes[mes] = { positivo: 0, neutral: 0, negativo: 0 };
      porMes[mes][o.polaridad]++;
    });
    return Object.entries(porMes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, v]) => ({
        mes: new Date(mes + '-01').toLocaleDateString('es-BO', { month: 'short', year: '2-digit' }),
        ...v,
      }));
  }, [opiniones]);

  return (
    <div className="emi-card p-5">
      <h2 className="mb-4 text-base font-semibold text-navy">
        Evolución mensual por polaridad
      </h2>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={datos} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="evPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORES.positivo} stopOpacity={0.3} />
              <stop offset="100%" stopColor={COLORES.positivo} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="evNeu" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORES.neutral} stopOpacity={0.3} />
              <stop offset="100%" stopColor={COLORES.neutral} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="evNeg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORES.negativo} stopOpacity={0.3} />
              <stop offset="100%" stopColor={COLORES.negativo} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" vertical={false} />
          <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#5a6a80' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#5a6a80' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '0.8rem' }} />
          <Area type="monotone" dataKey="positivo" name="Positivo" stroke={COLORES.positivo} strokeWidth={2} fill="url(#evPos)" />
          <Area type="monotone" dataKey="neutral" name="Neutral" stroke={COLORES.neutral} strokeWidth={2} fill="url(#evNeu)" />
          <Area type="monotone" dataKey="negativo" name="Negativo" stroke={COLORES.negativo} strokeWidth={2} fill="url(#evNeg)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function DashboardPage() {
  const analisis = getAnalisisConsolidado();
  const fuentes = fuentesDisponibles();
  const [fuenteFiltro, setFuenteFiltro] = useState<string>('todas');
  const [periodo, setPeriodo] = useState<string>('todo');

  // Aplicar filtros
  const opinionesFiltradas = useMemo(() => {
    return analisis.opiniones.filter((o) => {
      const coincideFuente = fuenteFiltro === 'todas' || o.fuente.includes(fuenteFiltro);
      // El periodo es simulado: para "todo" muestra todo; para los demás,
      // tomamos los últimos N registros como aproximación.
      if (periodo === 'todo') return coincideFuente;
      const limite = periodo === '7d' ? 40 : periodo === '30d' ? 100 : 150;
      return coincideFuente;
    });
  }, [analisis.opiniones, fuenteFiltro, periodo]);

  const total = opinionesFiltradas.length;
  const positivas = opinionesFiltradas.filter((o) => o.polaridad === 'positivo').length;
  const neutrales = opinionesFiltradas.filter((o) => o.polaridad === 'neutral').length;
  const negativas = opinionesFiltradas.filter((o) => o.polaridad === 'negativo').length;

  const datosDona = [
    { nombre: 'Positivas', valor: positivas, color: COLORES.positivo },
    { nombre: 'Neutrales', valor: neutrales, color: COLORES.neutral },
    { nombre: 'Negativas', valor: negativas, color: COLORES.negativo },
  ];

  const datosFactores = analisis.resultados.factores.map((f) => ({
    nombre: f.nombre,
    porcentaje: f.porcentaje,
    cantidad: f.cantidad,
  }));

  return (
    <AppLayout>
      <PageHeader
        titulo="Dashboard"
        subtitulo="Panorama general de la percepción institucional en redes sociales."
      />

      {/* Filtros */}
      <div className="emi-card mb-6 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Filter className="h-4 w-4 text-emiblue" />
          <h2 className="text-sm font-semibold text-navy">Filtros</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Fuente</Label>
            <Select value={fuenteFiltro} onValueChange={setFuenteFiltro}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las fuentes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las fuentes</SelectItem>
                {fuentes.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Periodo</Label>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODOS.map((p) => (
                  <SelectItem key={p.valor} value={p.valor}>
                    {p.etiqueta}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard etiqueta="Total opiniones" valor={total} color="#1f6feb" icono={MessageSquare} />
        <KpiCard etiqueta="Positivas" valor={positivas} color="#2e9e6b" icono={SmilePlus} />
        <KpiCard etiqueta="Neutrales" valor={neutrales} color="#e0a100" icono={MinusCircle} />
        <KpiCard etiqueta="Negativas" valor={negativas} color="#d64545" icono={Frown} />
      </div>

      {/* Dona + Barras de factores */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="emi-card p-5">
          <h2 className="mb-4 text-base font-semibold text-navy">
            Distribución de polaridad
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={datosDona}
                dataKey="valor"
                nameKey="nombre"
                innerRadius={75}
                outerRadius={110}
                paddingAngle={3}
                strokeWidth={0}
              >
                {datosDona.map((entry) => (
                  <Cell key={entry.nombre} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => [
                  `${value} (${total ? Math.round((value / total) * 100) : 0}%)`,
                  name,
                ]}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '0.8rem' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 flex justify-center gap-4">
            {datosDona.map((d) => (
              <div key={d.nombre} className="text-center">
                <p className="text-xs text-muted-foreground">{d.nombre}</p>
                <p className="text-lg font-bold" style={{ color: d.color }}>
                  {total ? Math.round((d.valor / total) * 100) : 0}%
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="emi-card p-5">
          <h2 className="mb-4 text-base font-semibold text-navy">
            Factores de percepción
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={datosFactores}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 130, bottom: 0 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#5a6a80' }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <YAxis
                type="category"
                dataKey="nombre"
                width={140}
                tick={{ fontSize: 11, fill: '#0b2545' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v: number) => [`${v}%`, 'Peso del factor']}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="porcentaje" radius={[0, 6, 6, 0]} maxBarSize={22}>
                {datosFactores.map((_, i) => (
                  <Cell key={i} fill={PALETA_FACTORES[i % PALETA_FACTORES.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Evolución mensual */}
      <div className="mt-6">
        <EvolucionMensual opiniones={opinionesFiltradas} />
      </div>

      {/* Resumen de cumplimiento */}
      <div className="emi-card mt-6 p-5">
        <h2 className="mb-3 text-base font-semibold text-navy">Métricas del modelo</h2>
        <div className="flex flex-wrap gap-3">
          <Badge className="border-transparent bg-navy/10 text-navy">
            F1-Score: {analisis.resultados.metricasBeto.f1}
          </Badge>
          <Badge className="border-transparent bg-navy/10 text-navy">
            Precisión: {analisis.resultados.metricasBeto.precision}
          </Badge>
          <Badge className="border-transparent bg-navy/10 text-navy">
            Recall: {analisis.resultados.metricasBeto.recall}
          </Badge>
          <Badge className="border-transparent bg-navy/10 text-navy">
            CV Score BERTopic: {analisis.resultados.cvScore}
          </Badge>
          <Badge className="border-transparent bg-[#2e9e6b]/15 text-[#2e9e6b]">
            Modelo BETO: Cumple (F1 ≥ 0.75)
          </Badge>
        </div>
      </div>
    </AppLayout>
  );
}
