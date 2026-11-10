import { getUsuarios } from '@/services/usuarios.service';
import type { Sesion, Usuario } from '@/types';

const SESION_KEY = 'percepcionemi_sesion';

export interface LoginResult {
  ok: boolean;
  error?: 'credenciales' | 'inactivo';
  usuario?: Omit<Usuario, 'contrasena'>;
}

function sinContrasena(u: Usuario): Omit<Usuario, 'contrasena'> {
  const { contrasena: _omit, ...resto } = u;
  return resto;
}

// Simula latencia de red para que se aprecien los estados de carga.
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function login(
  usuario: string,
  contrasena: string
): Promise<LoginResult> {
  await delay(600);
  const encontrado = getUsuarios().find(
    (u) => u.usuario.toLowerCase() === usuario.trim().toLowerCase()
  );
  if (!encontrado || encontrado.contrasena !== contrasena) {
    return { ok: false, error: 'credenciales' };
  }
  if (encontrado.estado !== 'activo') {
    return { ok: false, error: 'inactivo' };
  }
  const sesion: Sesion = {
    usuarioId: encontrado.id,
    iniciadaEn: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SESION_KEY, JSON.stringify(sesion));
  }
  return { ok: true, usuario: sinContrasena(encontrado) };
}

export function cerrarSesion(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(SESION_KEY);
  }
}

export function getSesionGuardada(): Sesion | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(SESION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Sesion;
  } catch {
    return null;
  }
}

export function getUsuarioPorId(id: string): Omit<Usuario, 'contrasena'> | null {
  const u = getUsuarios().find((x) => x.id === id);
  return u ? sinContrasena(u) : null;
}
