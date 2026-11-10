export type Plataforma = 'facebook' | 'google_maps';

export type TipoInformacion = 'publicaciones' | 'comentarios' | 'resenas';

export interface Fuente {
  id: string;
  plataforma: Plataforma;
  nombre: string;
  url: string;
  tipoInformacion: TipoInformacion;
  descripcion?: string;
  activa: boolean;
}

export const PLATAFORMA_LABEL: Record<Plataforma, string> = {
  facebook: 'Facebook',
  google_maps: 'Google Maps',
};

export const TIPO_INFO_LABEL: Record<TipoInformacion, string> = {
  publicaciones: 'Publicaciones',
  comentarios: 'Comentarios',
  resenas: 'Reseñas',
};
