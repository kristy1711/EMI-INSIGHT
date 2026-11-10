import type { LogLine } from '@/types/pln';

export interface OpinionScrapeada {
  id: string;
  fuente: string;
  texto: string;
  fecha: string;
}

const FRASES_NEGATIVAS = [
  'El proceso de inscripción es un caos, llevo horas esperando y nadie da respuesta.',
  'La atención en secretaría es pésima, te mandan de una oficina a otra sin solución.',
  'Las cuotas suben cada gestión y nadie explica en qué se invierte el dinero.',
  'Las aulas del campus viejo necesitan mantenimiento urgente, hace mucho calor.',
  'El régimen disciplinario es demasiado estricto y las sanciones son injustas.',
  'Poca comunicación de la dirección con los estudiantes sobre los horarios.',
  'Los laboratorios tienen equipos muy antiguos para las materias de software.',
  'La cola para trámites administrativos es interminable.',
  'Faltan espacios de estudio adecuados durante los períodos de examen.',
  'La evaluación docente no cambia nada, siempre los mismos problemas.',
];

const FRASES_NEUTRAS = [
  'La EMI abrió el proceso de inscripción para la gestión 2026.',
  'Las clases de primer semestre comienzan la próxima semana según el calendario.',
  'La universidad publicó el cronograma de exámenes de segundo semestre.',
  'Se inauguró el nuevo laboratorio de redes en el campus sur.',
  'La EMI participó en la feria de tecnología con proyectos de estudiantes.',
  'El rectorado anunció cambios en el plan de estudios de informática.',
  'Las prácticas preprofesionales comienzan en abril según lo programado.',
  'El centro de estudiantes convocó a las elecciones ordinarias.',
  'La unidad académica de La Paz amplió su capacidad de laboratorios.',
  'Se desarrolló el seminario de innovación tecnológica en las instalaciones.',
];

const FRASES_POSITIVAS = [
  'Excelente nivel académico, los docentes saben realmente de lo que enseñan.',
  'Muy orgullosa de la formación que recibo, la EMI es la mejor del país.',
  'El nuevo laboratorio de inteligencia artificial está equipado de primera.',
  'La títulación es un orgullo, salí muy preparado para el mercado laboral.',
  'Buenísimo el apoyo de los tutores en primer semestre, hacen la diferencia.',
  'Los convenios de intercambio son una gran oportunidad para crecer.',
  'La infraestructura nueva del campus es impresionante y moderna.',
  'Graduados de la EMI son de los más cotizados en las empresas del estado.',
  'El curso preuniversitario es muy completo y bien organizado.',
  'Muy buena la atención del departamento de bienestar estudiantil.',
];

const FECHAS = [
  '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04',
  '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08',
];

let semilla = 42;
function aleatorio(): number {
  semilla = (semilla * 1103515245 + 12345) % 2147483648;
  return semilla / 2147483648;
}

function elegir<T>(lista: T[]): T {
  return lista[Math.floor(aleatorio() * lista.length)];
}

export function generarOpiniones(cantidad: number, fuente: string): OpinionScrapeada[] {
  semilla = 42;
  const opiniones: OpinionScrapeada[] = [];
  for (let i = 0; i < cantidad; i++) {
    const azar = aleatorio();
    const texto =
      azar < 0.38
        ? elegir(FRASES_POSITIVAS)
        : azar < 0.72
          ? elegir(FRASES_NEUTRAS)
          : elegir(FRASES_NEGATIVAS);
    opiniones.push({
      id: `OP-${String(i + 1).padStart(4, '0')}`,
      fuente,
      texto,
      fecha: elegir(FECHAS),
    });
  }
  return opiniones;
}

export function construirLogsScraping(cantidad: number, fuente: string): LogLine[] {
  const logs: LogLine[] = [];
  logs.push({ texto: `Iniciando recopilación para fuente ${fuente}`, tipo: 'info' });
  logs.push({ texto: 'Lanzando navegador...', tipo: 'info' });
  logs.push({ texto: 'Cargando página...', tipo: 'info' });
  logs.push({ texto: 'Página cargada correctamente', tipo: 'exito' });
  for (let scroll = 1; scroll <= 10; scroll++) {
    logs.push({ texto: `Scroll ${scroll}/10...`, tipo: 'info' });
    const extraidos = Math.ceil(cantidad / 10);
    for (let i = 0; i < extraidos; i++) {
      const n = (scroll - 1) * extraidos + i + 1;
      if (n <= cantidad) {
        logs.push({ texto: `Opinión extraída #${n}`, tipo: 'exito' });
      }
    }
    if (scroll === 4) {
      logs.push({ texto: 'Advertencia: límite de peticiones alcanzado, esperando 2s...', tipo: 'warn' });
    }
    if (scroll === 7) {
      logs.push({ texto: 'Elemento repetido detectado, descartando duplicado', tipo: 'error' });
    }
  }
  logs.push({ texto: `Recopilación finalizada: ${cantidad} registros capturados`, tipo: 'exito' });
  return logs;
}
