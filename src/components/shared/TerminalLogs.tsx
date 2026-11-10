'use client';

import { useEffect, useRef } from 'react';
import type { LogLine } from '@/types/pln';

const COLOR_TIPO: Record<LogLine['tipo'], string> = {
  info: '#94a3b8',
  exito: '#4ade80',
  error: '#f87171',
  warn: '#fbbf24',
};

const PREFIJO_TIPO: Record<LogLine['tipo'], string> = {
  info: '[INFO]',
  exito: '[OK]',
  error: '[ERROR]',
  warn: '[WARN]',
};

export function TerminalLogs({ lineas }: { lineas: LogLine[] }) {
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [lineas.length]);

  return (
    <div
      className="overflow-y-auto rounded-xl p-4 font-mono text-xs leading-relaxed"
      style={{ backgroundColor: '#0F172A', minHeight: '220px', maxHeight: '320px' }}
    >
      {lineas.length === 0 ? (
        <p style={{ color: '#64748b' }}>$ Esperando instrucciones...</p>
      ) : (
        lineas.map((l, i) => (
          <p key={i} style={{ color: COLOR_TIPO[l.tipo] }}>
            {PREFIJO_TIPO[l.tipo]} {l.texto}
          </p>
        ))
      )}
      <div ref={finRef} />
    </div>
  );
}

export function BarraProgreso({ valor }: { valor: number }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-emiblue transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, valor))}%` }}
      />
    </div>
  );
}
