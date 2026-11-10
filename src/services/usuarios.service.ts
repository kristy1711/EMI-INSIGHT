import { USUARIOS_MOCK } from '@/data/usuarios';
import type { EstadoUsuario, Rol, Usuario } from '@/types';

const STORAGE_KEY = 'percepcionemi_usuarios';

export function getUsuarios(): Usuario[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(USUARIOS_MOCK));
    return USUARIOS_MOCK;
  }
  try {
    const datos = JSON.parse(raw) as Usuario[];
    return Array.isArray(datos) ? datos : USUARIOS_MOCK;
  } catch {
    return USUARIOS_MOCK;
  }
}

function guardarUsuarios(usuarios: Usuario[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
}

export function existeUsuario(
  usuario: string,
  exceptId?: string
): boolean {
  const objetivo = usuario.trim().toLowerCase();
  return getUsuarios().some(
    (u) => u.usuario.toLowerCase() === objetivo && u.id !== exceptId
  );
}

export interface NuevoUsuario {
  usuario: string;
  contrasena: string;
  nombres: string;
  apellidos: string;
  cargo: string;
  rol: Rol;
  estado: EstadoUsuario;
}

export function crearUsuario(datos: NuevoUsuario): Usuario {
  const usuarios = getUsuarios();
  const nuevo: Usuario = {
    id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    ...datos,
    nombre: `${datos.nombres} ${datos.apellidos}`.trim(),
  };
  guardarUsuarios([...usuarios, nuevo]);
  return nuevo;
}

export function actualizarUsuario(
  id: string,
  cambios: Partial<Omit<Usuario, 'id'>>
): Usuario | null {
  const usuarios = getUsuarios();
  const indice = usuarios.findIndex((u) => u.id === id);
  if (indice === -1) return null;
  const actualizado: Usuario = { ...usuarios[indice], ...cambios };
  if (cambios.nombres || cambios.apellidos) {
    actualizado.nombre = `${actualizado.nombres} ${actualizado.apellidos}`.trim();
  }
  usuarios[indice] = actualizado;
  guardarUsuarios(usuarios);
  return actualizado;
}
