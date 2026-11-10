'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { PlnResultados } from '@/types/pln';
import {
  getPlnResultados,
  guardarPlnResultados,
  limpiarPlnResultados,
} from '@/services/pln.service';

interface PlnContextValue {
  resultados: PlnResultados | null;
  guardar: (r: PlnResultados) => void;
  reiniciar: () => void;
  refrescar: () => void;
}

const PlnContext = createContext<PlnContextValue | null>(null);

export function PlnProvider({ children }: { children: ReactNode }) {
  const [resultados, setResultados] = useState<PlnResultados | null>(null);

  const refrescar = useCallback(() => {
    setResultados(getPlnResultados());
  }, []);

  useEffect(() => {
    refrescar();
  }, [refrescar]);

  const guardar = useCallback((r: PlnResultados) => {
    guardarPlnResultados(r);
    setResultados(r);
  }, []);

  const reiniciar = useCallback(() => {
    limpiarPlnResultados();
    setResultados(null);
  }, []);

  return (
    <PlnContext.Provider value={{ resultados, guardar, reiniciar, refrescar }}>
      {children}
    </PlnContext.Provider>
  );
}

export function usePln(): PlnContextValue {
  const ctx = useContext(PlnContext);
  if (!ctx) throw new Error('usePln debe usarse dentro de PlnProvider');
  return ctx;
}
