'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Usuario } from '@/types';
import {
  actualizarUsuario,
  crearUsuario,
  existeUsuario,
  getUsuarios,
  type NuevoUsuario,
} from '@/services/usuarios.service';

interface UsuariosContextValue {
  usuarios: Usuario[];
  crear: (datos: NuevoUsuario) => { ok: boolean; error?: string };
  actualizar: (
    id: string,
    cambios: Partial<Omit<Usuario, 'id'>>
  ) => { ok: boolean; error?: string };
  usuarioUnico: (usuario: string, exceptId?: string) => boolean;
  refrescar: () => void;
}

const UsuariosContext = createContext<UsuariosContextValue | null>(null);

export function UsuariosProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const refrescar = useCallback(() => {
    setUsuarios(getUsuarios());
  }, []);

  useEffect(() => {
    refrescar();
  }, [refrescar]);

  const crear = useCallback((datos: NuevoUsuario) => {
    if (existeUsuario(datos.usuario)) {
      return { ok: false, error: 'El nombre de usuario ya existe.' };
    }
    crearUsuario(datos);
    refrescar();
    return { ok: true };
  }, [refrescar]);

  const actualizar = useCallback(
    (id: string, cambios: Partial<Omit<Usuario, 'id'>>) => {
      if (
        cambios.usuario &&
        existeUsuario(cambios.usuario, id)
      ) {
        return { ok: false, error: 'El nombre de usuario ya existe.' };
      }
      const resultado = actualizarUsuario(id, cambios);
      refrescar();
      return resultado
        ? { ok: true }
        : { ok: false, error: 'Usuario no encontrado.' };
    },
    [refrescar]
  );

  const usuarioUnico = useCallback(
    (usuario: string, exceptId?: string) => !existeUsuario(usuario, exceptId),
    []
  );

  return (
    <UsuariosContext.Provider
      value={{ usuarios, crear, actualizar, usuarioUnico, refrescar }}
    >
      {children}
    </UsuariosContext.Provider>
  );
}

export function useUsuarios(): UsuariosContextValue {
  const ctx = useContext(UsuariosContext);
  if (!ctx) throw new Error('useUsuarios debe usarse dentro de UsuariosProvider');
  return ctx;
}
