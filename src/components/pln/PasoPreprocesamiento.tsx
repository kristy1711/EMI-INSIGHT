'use client';

import { useState } from 'react';
import { Loader2, Play, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarraProgreso, TerminalLogs } from '@/components/shared/TerminalLogs';
import { logsPreprocesamiento } from '@/services/pln.service';
import type { LogLine } from '@/types/pln';

const intervaloMs = 350;

export default function PasoPreprocesamiento({
  onCompletado,
}: {
  onCompletado: () => void;
}) {
  const [ejecutando, setEjecutando] = useState(false);
  const [completado, setCompletado] = useState(false);
  const [lineas, setLineas] = useState<LogLine[]>([]);
  const [progreso, setProgreso] = useState(0);

  function iniciar() {
    const plan = logsPreprocesamiento();
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { etiqueta: 'Registros totales', valor: 180, color: '#0b2545' },
          { etiqueta: 'Válidos', valor: 172, color: '#2e9e6b' },
          { etiqueta: 'Descartados', valor: 8, color: '#d64545' },
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
      </div>

      <div className="emi-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-navy">Preprocesamiento del corpus</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Limpieza, tokenización, stopwords y lematización de las 180 opiniones.
            </p>
          </div>
          <Button
            onClick={iniciar}
            disabled={ejecutando}
            className="emi-btn-primary h-10 rounded-xl px-6 font-semibold"
          >
            {ejecutando ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : completado ? (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {ejecutando ? 'Procesando...' : completado ? 'Reejecutar' : 'Iniciar preprocesamiento'}
          </Button>
        </div>
        {lineas.length > 0 && (
          <div className="mt-5 space-y-4">
            <BarraProgreso valor={progreso} />
            <TerminalLogs lineas={lineas} />
          </div>
        )}
      </div>
    </div>
  );
}
