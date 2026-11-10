'use client';

import { useState } from 'react';
import { Loader2, Play, CheckCircle2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { BarraProgreso, TerminalLogs } from '@/components/shared/TerminalLogs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { logsBertopic, FACTORES } from '@/services/pln.service';
import type { LogLine } from '@/types/pln';

const intervaloMs = 320;

const PALETA = [
  '#0b2545', '#1f6feb', '#2e9e6b', '#c9a227',
  '#e0a100', '#d64545', '#5a6a80',
];

export default function PasoBertopic({
  habilitado,
  onCompletado,
}: {
  habilitado: boolean;
  onCompletado: () => void;
}) {
  const [ejecutando, setEjecutando] = useState(false);
  const [completado, setCompletado] = useState(false);
  const [lineas, setLineas] = useState<LogLine[]>([]);
  const [progreso, setProgreso] = useState(0);

  function iniciar() {
    const plan = logsBertopic();
    setEjecutando(true);
    setCompletado(false);
    setLineas([]);
    setProgreso(0);
    let i = 0;
    const t = setInterval(() => {
      i++;
      setLineas(plan.slice(0, i).map((l) => ({ texto: l.texto, tipo: l.tipo as LogLine['tipo'] })));
      setProgreso(Math.round((i / plan.length) * 100));
      if (i >= plan.length) {
        clearInterval(t);
        setEjecutando(false);
        setCompletado(true);
        onCompletado();
      }
    }, intervaloMs);
  }

  return (
    <div className="space-y-6">
      <div className="emi-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-navy">
              Modelado temático con BERTopic
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Identificación de factores de percepción a partir de las opiniones negativas.
            </p>
          </div>
          <Button
            onClick={iniciar}
            disabled={ejecutando || !habilitado}
            className="emi-btn-primary h-10 rounded-xl px-6 font-semibold"
          >
            {ejecutando ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : completado ? (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {ejecutando ? 'Procesando...' : completado ? 'Reejecutar' : 'Iniciar modelado'}
          </Button>
        </div>
        {lineas.length > 0 && (
          <div className="mt-5 space-y-4">
            <BarraProgreso valor={progreso} />
            <TerminalLogs lineas={lineas} />
          </div>
        )}
      </div>

      {completado && (
        <>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="emi-card p-5 xl:col-span-2">
              <h2 className="mb-4 text-base font-semibold text-navy">
                Factores de percepción identificados (opiniones negativas)
              </h2>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={FACTORES.map((f) => ({ nombre: f.nombre, porcentaje: f.porcentaje }))}
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
                    width={150}
                    tick={{ fontSize: 11, fill: '#0b2545' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v: number) => [`${v}%`, 'Peso del factor']}
                    contentStyle={{
                      borderRadius: '0.75rem',
                      border: '1px solid #e8edf5',
                      boxShadow: '0 8px 24px rgba(11, 37, 69, 0.12)',
                      fontSize: '0.8rem',
                    }}
                  />
                  <Bar dataKey="porcentaje" radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {FACTORES.map((_, i) => (
                      <Cell key={i} fill={PALETA[i % PALETA.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col justify-center emi-card p-6 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                CV Score del modelo
              </p>
              <p className="mt-2 text-5xl font-bold text-emiblue">0.68</p>
              <p className="mt-3 text-xs text-muted-foreground">
                Coherencia promedio de los 7 tópicos generados.
              </p>
            </div>
          </div>

          <div className="emi-card p-6">
            <h2 className="mb-4 text-base font-semibold text-navy">
              Términos representativos por factor
            </h2>
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table className="emi-table">
                <TableHeader>
                  <TableRow className="bg-muted/60 hover:bg-muted/60">
                    <TableHead className="text-navy">Factor</TableHead>
                    <TableHead className="text-navy">Peso</TableHead>
                    <TableHead className="text-navy">Opiniones</TableHead>
                    <TableHead className="text-navy">Términos representativos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FACTORES.map((f) => (
                    <TableRow key={f.nombre}>
                      <TableCell className="font-medium text-navy">{f.nombre}</TableCell>
                      <TableCell>{f.porcentaje}%</TableCell>
                      <TableCell>{f.cantidad}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {f.terminos.map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
