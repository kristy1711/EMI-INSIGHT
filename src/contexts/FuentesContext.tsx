'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Fuente } from '@/types/fuentes';
import {
  cambiarEstadoFuente,
  crearFuente,
  eliminarFuente as eliminarFuenteService,
  getFuentes,
  type NuevaFuente,
} from '@/services/fuentes.service';

interface FuentesContextValue {
  fuentes: Fuente[];
  fuentesActivas: Fuente[];
  crear: (datos: NuevaFuente) => Fuente;
  cambiarEstado: (id: string, activa: boolean) => void;
  eliminar: (id: string) => void;
  refrescar: () => void;
}

const FuentesContext = createContext<FuentesContextValue | null>(null);

export function FuentesProvider({ children }: { children: ReactNode }) {
  const [fuentes, setFuentes] = useState<Fuente[]>([]);

  const refrescar = useCallback(() => {
    setFuentes(getFuentes());
  }, []);

  useEffect(() => {
    refrescar();
  }, [refrescar]);

  const crear = useCallback(
    (datos: NuevaFuente) => {
      const nueva = crearFuente(datos);
      refrescar();
      return nueva;
    },
    [refrescar]
  );

  const cambiarEstado = useCallback(
    (id: string, activa: boolean) => {
      cambiarEstadoFuente(id, activa);
      refrescar();
    },
    [refrescar]
  );

  const eliminar = useCallback(
    (id: string) => {
      eliminarFuenteService(id);
      refrescar();
    },
    [refrescar]
  );

  return (
    <FuentesContext.Provider
      value={{
        fuentes,
        fuentesActivas: fuentes.filter((f) => f.activa),
        crear,
        cambiarEstado,
        eliminar,
        refrescar,
      }}
    >
      {children}
    </FuentesContext.Provider>
  );
}

export function useFuentes(): FuentesContextValue {
  const ctx = useContext(FuentesContext);
  if (!ctx) throw new Error('useFuentes debe usarse dentro de FuentesProvider');
  return ctx;
}
