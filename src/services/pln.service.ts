import type { FactorTema, PlnResultados, LogLine } from '@/types/pln';
import { generarOpiniones, type OpinionScrapeada } from '@/data/scraping';

const STORAGE_KEY = 'percepcionemi_pln_resultados';

export function generarCorpus(): OpinionScrapeada[] {
  return generarOpiniones(180, 'Mixto (F01, F02, F03)');
}

export const CORPUS_RESUMEN = {
  totales: 180,
  validos: 172,
  descartados: 8,
};

export function logsPreprocesamiento(): LogLine[] {
  return [
    { texto: 'Cargando corpus crudo (180 registros)...', tipo: 'info' },
    { texto: 'Normalizando Unicode (NFC)...', tipo: 'info' },
    { texto: 'Convirtiendo a minúsculas...', tipo: 'info' },
    { texto: 'Eliminando URLs, menciones y hashtags...', tipo: 'info' },
    { texto: 'Eliminando caracteres no relevantes (puntuación y emojis residuales)...', tipo: 'info' },
    { texto: 'Tokenizando corpus...', tipo: 'info' },
    { texto: 'Aplicando lista de stopwords en español (312 términos)...', tipo: 'info' },
    { texto: 'Lematizando tokens...', tipo: 'info' },
    { texto: 'Filtrando ruido: 8 registros descartados por longitud insuficiente', tipo: 'warn' },
    { texto: 'Preprocesamiento completado: 172 registros válidos listos para clasificación', tipo: 'exito' },
  ];
}

export function logsBeto(): LogLine[] {
  return [
    { texto: 'Cargando modelo BETO (dccuchile/bert-base-spanish-wwm-cased)...', tipo: 'info' },
    { texto: 'Modelo cargado en memoria (331M parámetros)', tipo: 'exito' },
    { texto: 'Preparando DataLoader con batch size 32...', tipo: 'info' },
    { texto: 'Ejecutando inferencia por lotes (172 registros)...', tipo: 'info' },
    { texto: 'Lote 1/6 clasificado', tipo: 'info' },
    { texto: 'Lote 2/6 clasificado', tipo: 'info' },
    { texto: 'Lote 3/6 clasificado', tipo: 'info' },
    { texto: 'Lote 4/6 clasificado', tipo: 'info' },
    { texto: 'Lote 5/6 clasificado', tipo: 'info' },
    { texto: 'Lote 6/6 clasificado', tipo: 'info' },
    { texto: 'Calculando métricas sobre el conjunto de validación...', tipo: 'info' },
    { texto: 'Clasificación completada: F1=0.824, Precisión=0.831, Recall=0.817', tipo: 'exito' },
  ];
}

export function logsBertopic(): LogLine[] {
  return [
    { texto: 'Seleccionando opiniones negativas (35 de 172)...', tipo: 'info' },
    { texto: 'Generando embeddings de sentencias (paraphrase-multilingual)...', tipo: 'info' },
    { texto: 'Embeddings generados (768 dimensiones)', tipo: 'exito' },
    { texto: 'Reduzco dimensionalidad con UMAP (n_neighbors=15, min_dist=0.1)...', tipo: 'info' },
    { texto: 'UMAP completado', tipo: 'exito' },
    { texto: 'Agrupando con HDBSCAN (min_cluster_size=4)...', tipo: 'info' },
    { texto: '7 tópicos identificados, 0 outliers', tipo: 'exito' },
    { texto: 'Extrayendo términos representativos con c-TF-IDF...', tipo: 'info' },
    { texto: 'Modelado temático completado: 7 factores de percepción', tipo: 'exito' },
  ];
}

export const FACTORES: FactorTema[] = [
  {
    nombre: 'Gestión administrativa',
    porcentaje: 22.9,
    cantidad: 8,
    terminos: ['inscripción', 'secretaría', 'trámite', 'cola', 'respuesta', 'oficina'],
  },
  {
    nombre: 'Calidad académica',
    porcentaje: 19.1,
    cantidad: 7,
    terminos: ['docentes', 'materias', 'plan', 'estudios', 'clases', 'aprendizaje'],
  },
  {
    nombre: 'Infraestructura',
    porcentaje: 15.3,
    cantidad: 5,
    terminos: ['aulas', 'laboratorio', 'campus', 'equipos', 'mantenimiento', 'calor'],
  },
  {
    nombre: 'Costos y pagos',
    porcentaje: 12.0,
    cantidad: 4,
    terminos: ['cuotas', 'pagos', 'dinero', 'costo', 'aumento', 'pago'],
  },
  {
    nombre: 'Atención estudiantil',
    porcentaje: 10.9,
    cantidad: 4,
    terminos: ['atención', 'bienestar', 'tutores', 'apoyo', 'orientación', 'becas'],
  },
  {
    nombre: 'Régimen disciplinario',
    porcentaje: 9.8,
    cantidad: 3,
    terminos: ['sanción', 'disciplina', 'reglamento', 'conducta', 'notificación'],
  },
  {
    nombre: 'Imagen institucional',
    porcentaje: 9.8,
    cantidad: 3,
    terminos: ['prestigio', 'imagen', 'reputación', 'comunicación', 'marca'],
  },
];

export const MUESTRA_CLASIFICACION: {
  texto: string;
  polaridad: 'positivo' | 'neutral' | 'negativo';
  confianza: number;
}[] = [
  { texto: 'Excelente nivel académico, los docentes saben realmente de lo que enseñan.', polaridad: 'positivo', confianza: 0.94 },
  { texto: 'El proceso de inscripción es un caos, llevo horas esperando y nadie da respuesta.', polaridad: 'negativo', confianza: 0.91 },
  { texto: 'La EMI abrió el proceso de inscripción para la gestión 2026.', polaridad: 'neutral', confianza: 0.88 },
  { texto: 'Muy orgullosa de la formación que recibo, la EMI es la mejor del país.', polaridad: 'positivo', confianza: 0.96 },
  { texto: 'La atención en secretaría es pésima, te mandan de una oficina a otra sin solución.', polaridad: 'negativo', confianza: 0.93 },
  { texto: 'Las clases de primer semestre comienzan la próxima semana según el calendario.', polaridad: 'neutral', confianza: 0.85 },
  { texto: 'Las cuotas suben cada gestión y nadie explica en qué se invierte el dinero.', polaridad: 'negativo', confianza: 0.9 },
  { texto: 'El nuevo laboratorio de inteligencia artificial está equipado de primera.', polaridad: 'positivo', confianza: 0.95 },
];

export const RESULTADOS_ESPERADOS: Omit<PlnResultados, 'generadoEn'> = {
  corpus: CORPUS_RESUMEN,
  sentimientos: { positivo: 41.9, neutral: 37.2, negativo: 20.9 },
  metricasBeto: { f1: 0.824, precision: 0.831, recall: 0.817 },
  cvScore: 0.68,
  factores: FACTORES,
};

export function guardarPlnResultados(resultados: PlnResultados): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resultados));
}

export function getPlnResultados(): PlnResultados | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PlnResultados;
  } catch {
    return null;
  }
}

export function limpiarPlnResultados(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
