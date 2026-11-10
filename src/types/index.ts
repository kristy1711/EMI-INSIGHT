export type Rol = 'superadministrador' | 'administrador' | 'usuario';

export type EstadoUsuario = 'activo' | 'inactivo';

export interface Usuario {
  id: string;
  usuario: string;
  contrasena: string;
  nombre: string;
  nombres?: string;
  apellidos?: string;
  cargo: string;
  rol: Rol;
  estado: EstadoUsuario;
}

export interface Sesion {
  usuarioId: string;
  iniciadaEn: string;
}

export const ROL_LABEL: Record<Rol, string> = {
  superadministrador: 'Superadministrador',
  administrador: 'Administrador',
  usuario: 'Usuario',
};

export const SENTIMIENTO_COLOR = {
  positivo: 'var(--sentiment-positive)',
  neutral: 'var(--sentiment-neutral)',
  negativo: 'var(--sentiment-negative)',
} as const;
