import { getPlnResultados, RESULTADOS_ESPERADOS } from '@/services/pln.service';
import { getFuentes } from '@/services/fuentes.service';
import { generarOpiniones, type OpinionScrapeada } from '@/data/scraping';
import type { PlnResultados } from '@/types/pln';

export interface OpinionAnalizada extends OpinionScrapeada {
  polaridad: 'positivo' | 'neutral' | 'negativo';
  factor: string;
}

export interface AnalisisConsolidado {
  resultados: PlnResultados;
  opiniones: OpinionAnalizada[];
}

function asignarFactor(i: number): string {
  const factores = [
    'Gestión administrativa',
    'Calidad académica',
    'Infraestructura',
    'Costos y pagos',
    'Atención estudiantil',
    'Régimen disciplinario',
    'Imagen institucional',
  ];
  // Distribución aproximada a los porcentajes del análisis BERTopic.
  const pesos = [0.229, 0.191, 0.153, 0.12, 0.109, 0.098, 0.1];
  const acumulado = pesos
    .map((_, idx) => pesos.slice(0, idx + 1).reduce((a, b) => a + b, 0));
  const r = ((i * 37) % 1000) / 1000;
  const limite = r * acumulado[acumulado.length - 1];
  for (let idx = 0; idx < acumulado.length; idx++) {
    if (limite <= acumulado[idx]) return factores[idx];
  }
  return factores[0];
}

export function getAnalisisConsolidado(): AnalisisConsolidado {
  const guardado = getPlnResultados();
  const resultados: PlnResultados =
    guardado ?? { ...RESULTADOS_ESPERADOS, generadoEn: new Date().toISOString() };
  const opiniones = generarOpiniones(180, 'Mixto (F01, F02, F03)').map((o, i) => {
    const azar = ((i * 53) % 100) / 100;
    const polaridad =
      azar < resultados.sentimientos.positivo / 100
        ? 'positivo'
        : azar < (resultados.sentimientos.positivo + resultados.sentimientos.neutral) / 100
          ? 'neutral'
          : 'negativo';
    return { ...o, polaridad, factor: asignarFactor(i) };
  });
  return { resultados, opiniones };
}

export function fuentesDisponibles(): { id: string; nombre: string }[] {
  return getFuentes().map((f) => ({ id: f.id, nombre: `${f.id} — ${f.nombre}` }));
}
