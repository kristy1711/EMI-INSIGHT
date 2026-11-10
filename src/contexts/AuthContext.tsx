'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Rol, Usuario } from '@/types';
import {
  cerrarSesion as cerrarSesionService,
  getSesionGuardada,
  getUsuarioPorId,
  login as loginService,
} from '@/services/auth.service';

interface AuthContextValue {
  usuario: Omit<Usuario, 'contrasena'> | null;
  cargando: boolean;
  rol: Rol | null;
  tieneRol: (...roles: Rol[]) => boolean;
  login: (usuario: string, contrasena: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Omit<Usuario, 'contrasena'> | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const sesion = getSesionGuardada();
    if (sesion) {
      const u = getUsuarioPorId(sesion.usuarioId);
      if (u) setUsuario(u);
    }
    setCargando(false);
  }, []);

  const login = useCallback(async (usuarioInput: string, contrasena: string) => {
    const resultado = await loginService(usuarioInput, contrasena);
    if (resultado.ok && resultado.usuario) {
      setUsuario(resultado.usuario);
      return { ok: true };
    }
    if (resultado.error === 'inactivo') {
      return { ok: false, error: 'La cuenta está inactiva. Contacte al superadministrador.' };
    }
    return { ok: false, error: 'Usuario o contraseña incorrectos.' };
  }, []);

  const logout = useCallback(() => {
    cerrarSesionService();
    setUsuario(null);
  }, []);

  const tieneRol = useCallback(
    (...roles: Rol[]) => !!usuario && roles.includes(usuario.rol),
    [usuario]
  );

  return (
    <AuthContext.Provider
      value={{ usuario, cargando, rol: usuario?.rol ?? null, tieneRol, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
