'use client';

import { useState } from 'react';
import { Loader2, Play, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarraProgreso, TerminalLogs } from '@/components/shared/TerminalLogs';
import { logsBeto, MUESTRA_CLASIFICACION } from '@/services/pln.service';
import type { LogLine } from '@/types/pln';

const intervaloMs = 280;

const POLARIDAD_CLASE = {
  positivo: 'bg-[#2e9e6b]/15 text-[#2e9e6b] border-transparent',
  neutral: 'bg-[#e0a100]/15 text-[#e0a100] border-transparent',
  negativo: 'bg-[#d64545]/15 text-[#d64545] border-transparent',
} as const;

const POLARIDAD_TEXTO = {
  positivo: 'Positivo',
  neutral: 'Neutral',
  negativo: 'Negativo',
} as const;

export default function PasoBeto({
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
    const plan = logsBeto();
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
              Clasificación de sentimiento con BETO
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Modelo BERT en español entrenado para detectar polaridad en las opiniones.
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
            {ejecutando ? 'Clasificando...' : completado ? 'Reejecutar' : 'Iniciar clasificación'}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { etiqueta: 'F1-Score', valor: '0.824', color: '#1f6feb' },
              { etiqueta: 'Precisión', valor: '0.831', color: '#0b2545' },
              { etiqueta: 'Recall', valor: '0.817', color: '#0b2545' },
            ].map((m) => (
              <div key={m.etiqueta} className="emi-card p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {m.etiqueta}
                </p>
                <p className="mt-1 text-3xl font-bold" style={{ color: m.color }}>
                  {m.valor}
                </p>
              </div>
            ))}
            <div className="emi-card flex flex-col justify-center p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Estado de cumplimiento
              </p>
              <Badge className="mt-2 w-fit border-transparent bg-[#2e9e6b]/15 text-[#2e9e6b]">
                Cumple (F1 ≥ 0.75)
              </Badge>
            </div>
          </div>

          <div className="emi-card p-6">
            <h2 className="mb-4 text-base font-semibold text-navy">
              Opiniones de ejemplo clasificadas
            </h2>
            <div className="divide-y divide-border rounded-lg border border-border">
              {MUESTRA_CLASIFICACION.map((op, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="max-w-xl text-sm text-foreground">{op.texto}</p>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge variant="outline" className={`border ${POLARIDAD_CLASE[op.polaridad]}`}>
                      {POLARIDAD_TEXTO[op.polaridad]}
                    </Badge>
                    <div className="w-28">
                      <Progress value={op.confianza * 100} className="h-2" />
                      <p className="mt-1 text-right text-[11px] text-muted-foreground">
                        {Math.round(op.confianza * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
