import type { Fuente, Plataforma, TipoInformacion } from '@/types/fuentes';

const STORAGE_KEY = 'percepcionemi_fuentes';

export const FUENTES_INICIALES: Fuente[] = [
  {
    id: 'F01',
    plataforma: 'facebook',
    nombre: 'EMI Oficial',
    url: 'https://facebook.com/emi.oficial',
    tipoInformacion: 'publicaciones',
    descripcion: 'Página oficial de la Escuela Militar de Ingeniería.',
    activa: true,
  },
  {
    id: 'F02',
    plataforma: 'google_maps',
    nombre: 'Escuela Militar de Ingeniería - La Paz',
    url: 'https://google.com/maps/place/emi-lapaz',
    tipoInformacion: 'resenas',
    descripcion: 'Ficha de Google Maps del campus La Paz.',
    activa: true,
  },
  {
    id: 'F03',
    plataforma: 'facebook',
    nombre: 'EMI UALP Estudiantes',
    url: 'https://facebook.com/emi.ualp.estudiantes',
    tipoInformacion: 'comentarios',
    descripcion: 'Grupo de estudiantes de la unidad académica La Paz.',
    activa: false,
  },
];

export function getFuentes(): Fuente[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(FUENTES_INICIALES));
    return FUENTES_INICIALES;
  }
  try {
    const datos = JSON.parse(raw) as Fuente[];
    return Array.isArray(datos) ? datos : FUENTES_INICIALES;
  } catch {
    return FUENTES_INICIALES;
  }
}

function guardarFuentes(fuentes: Fuente[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fuentes));
}

export function siguienteIdFuente(fuentes: Fuente[]): string {
  const maximo = fuentes.reduce((acc, f) => {
    const num = parseInt(f.id.replace('F', ''), 10);
    return Number.isNaN(num) ? acc : Math.max(acc, num);
  }, 0);
  return `F${String(maximo + 1).padStart(2, '0')}`;
}

export interface NuevaFuente {
  plataforma: Plataforma;
  nombre: string;
  url: string;
  tipoInformacion: TipoInformacion;
  descripcion?: string;
  activa: boolean;
}

export function crearFuente(datos: NuevaFuente): Fuente {
  const fuentes = getFuentes();
  const nueva: Fuente = { id: siguienteIdFuente(fuentes), ...datos };
  guardarFuentes([...fuentes, nueva]);
  return nueva;
}

export function cambiarEstadoFuente(id: string, activa: boolean): void {
  const fuentes = getFuentes();
  const indice = fuentes.findIndex((f) => f.id === id);
  if (indice !== -1) {
    fuentes[indice].activa = activa;
    guardarFuentes(fuentes);
  }
}

export function eliminarFuente(id: string): void {
  guardarFuentes(getFuentes().filter((f) => f.id !== id));
}
