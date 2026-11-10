/**
 * Servicio de reportes / datos simulados.
 * Los métodos devuelven promesas para simular un backend real.
 * Al conectar Supabase u otro backend, solo cambia este archivo.
 */

export interface IndicadoresGenerales {
  mencionesTotales: number;
  sentimientoPositivo: number;
  sentimientoNeutral: number;
  sentimientoNegativo: number;
  fuentesActivas: number;
  variacionSemanal: number;
}

export interface MencionPorDia {
  fecha: string;
  positivo: number;
  neutral: number;
  negativo: number;
}

export interface Redistribucion {
  red: string;
  menciones: number;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getIndicadores(): Promise<IndicadoresGenerales> {
  await delay(800);
  return {
    mencionesTotales: 1243,
    sentimientoPositivo: 58,
    sentimientoNeutral: 27,
    sentimientoNegativo: 15,
    fuentesActivas: 6,
    variacionSemanal: 8.4,
  };
}

export async function getMencionesPorDia(): Promise<MencionPorDia[]> {
  await delay(600);
  return [
    { fecha: '01 nov', positivo: 34, neutral: 18, negativo: 7 },
    { fecha: '02 nov', positivo: 41, neutral: 15, negativo: 5 },
    { fecha: '03 nov', positivo: 28, neutral: 22, negativo: 9 },
    { fecha: '04 nov', positivo: 52, neutral: 19, negativo: 4 },
    { fecha: '05 nov', positivo: 47, neutral: 25, negativo: 11 },
    { fecha: '06 nov', positivo: 61, neutral: 17, negativo: 6 },
    { fecha: '07 nov', positivo: 55, neutral: 21, negativo: 8 },
  ];
}

export async function getDistribucionPorRed(): Promise<Redistribucion[]> {
  await delay(600);
  return [
    { red: 'Facebook', menciones: 512 },
    { red: 'X (Twitter)', menciones: 348 },
    { red: 'Instagram', menciones: 214 },
    { red: 'TikTok', menciones: 120 },
    { red: 'YouTube', menciones: 49 },
  ];
}
