export type Polaridad = 'positivo' | 'neutral' | 'negativo';

export interface MetricasBeto {
  f1: number;
  precision: number;
  recall: number;
}

export interface FactorTema {
  nombre: string;
  porcentaje: number;
  cantidad: number;
  terminos: string[];
}

export interface PlnResultados {
  generadoEn: string;
  corpus: { totales: number; validos: number; descartados: number };
  sentimientos: { positivo: number; neutral: number; negativo: number };
  metricasBeto: MetricasBeto;
  cvScore: number;
  factores: FactorTema[];
}

export interface LogLine {
  texto: string;
  tipo: 'info' | 'exito' | 'error' | 'warn';
}
