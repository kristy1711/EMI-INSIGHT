import type { Usuario } from '@/types';

export const USUARIOS_MOCK: Usuario[] = [
  {
    id: 'usr-001',
    usuario: 'admin',
    contrasena: 'admin123',
    nombre: 'Carlos Mendoza Rojas',
    cargo: 'Superadministrador del sistema',
    rol: 'superadministrador',
    estado: 'activo',
  },
  {
    id: 'usr-002',
    usuario: 'analista',
    contrasena: 'analista123',
    nombre: 'María Fernanda Quispe',
    cargo: 'Analista de comunicación institucional',
    rol: 'administrador',
    estado: 'activo',
  },
  {
    id: 'usr-003',
    usuario: 'apoyo',
    contrasena: 'apoyo123',
    nombre: 'Juan Pérez Llanos',
    cargo: 'Personal de apoyo',
    rol: 'usuario',
    estado: 'activo',
  },
  {
    id: 'usr-004',
    usuario: 'inactivo',
    contrasena: 'inactivo123',
    nombre: 'Rolando Vásquez',
    cargo: 'Personal de apoyo (baja)',
    rol: 'usuario',
    estado: 'inactivo',
  },
];
