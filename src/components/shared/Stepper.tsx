'use client';

import { Check } from 'lucide-react';

export interface PasoStepper {
  titulo: string;
}

export function Stepper({
  pasos,
  pasoActual,
  pasoCompletado,
  onSeleccionar,
}: {
  pasos: PasoStepper[];
  pasoActual: number;
  pasoCompletado: number;
  onSeleccionar: (indice: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <ol className="flex min-w-max items-center gap-2">
        {pasos.map((paso, i) => {
          const completado = i < pasoCompletado;
          const actual = i === pasoActual;
          const habilitado = i <= pasoCompletado;
          return (
            <li key={paso.titulo} className="flex items-center">
              <button
                type="button"
                disabled={!habilitado}
                onClick={() => habilitado && onSeleccionar(i)}
                className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                  completado
                    ? 'border-[#2e9e6b]/40 bg-[#2e9e6b]/10 text-[#2e9e6b]'
                    : actual
                      ? 'border-emiblue bg-emiblue/10 text-emiblue'
                      : 'border-border bg-white text-muted-foreground'
                } ${habilitado ? 'cursor-pointer hover:border-emiblue/50' : 'cursor-not-allowed opacity-60'}`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    completado
                      ? 'bg-[#2e9e6b] text-white'
                      : actual
                        ? 'bg-emiblue text-white'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {completado ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className="whitespace-nowrap font-medium">{paso.titulo}</span>
              </button>
              {i < pasos.length - 1 && (
                <span
                  className={`mx-1 h-0.5 w-6 rounded-full ${
                    i < pasoCompletado ? 'bg-[#2e9e6b]' : 'bg-border'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
