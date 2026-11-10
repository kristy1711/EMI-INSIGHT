'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Download, Play, RotateCcw, CalendarRange, Rss } from 'lucide-react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { TerminalLogs, BarraProgreso } from '@/components/shared/TerminalLogs';
import { useAuth } from '@/contexts/AuthContext';
import { useFuentes } from '@/contexts/FuentesContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { descargarCSV } from '@/lib/csv';
import {
  construirLogsScraping,
  generarOpiniones,
  type OpinionScrapeada,
} from '@/data/scraping';
import { PLATAFORMA_LABEL, type Fuente } from '@/types/fuentes';
import type { LogLine } from '@/types/pln';
import type { Rol } from '@/types';

const ROLES_PERMITIDOS: Rol[] = ['superadministrador', 'administrador'];

const intervaloMs = 120;

export default function ScrapingPage() {
  return (
    <AppLayout>
      <AuthGuard permitidos={ROLES_PERMITIDOS}>
        <ScrapingPageInner />
      </AuthGuard>
    </AppLayout>
  );
}

function ScrapingPageInner() {
  const { rol, cargando: cargandoAuth } = useAuth();
  const { fuentesActivas } = useFuentes();

  const [fuenteId, setFuenteId] = useState<string>('');
  const [desde, setDesde] = useState('2026-11-01');
  const [hasta, setHasta] = useState('2026-11-08');
  const [ejecutando, setEjecutando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [lineaActual, setLineaActual] = useState(0);
  const [extraidos, setExtraidos] = useState(0);
  const [nuevos, setNuevos] = useState(0);
  const [pendientes, setPendientes] = useState(0);
  const [resultado, setResultado] = useState<OpinionScrapeada[] | null>(null);
  const temporizador = useRef<ReturnType<typeof setInterval> | null>(null);

  const fuenteSeleccionada = fuentesActivas.find((f) => f.id === fuenteId);

  const limpiarTemporizador = useCallback(() => {
    if (temporizador.current) {
      clearInterval(temporizador.current);
      temporizador.current = null;
    }
  }, []);

  useEffect(() => limpiarTemporizador, [limpiarTemporizador]);

  function iniciar() {
    if (!fuenteSeleccionada) {
      toast.error('Seleccione una fuente activa para recopilar.');
      return;
    }
    if (!desde || !hasta || desde > hasta) {
      toast.error('El rango de fechas no es válido.');
      return;
    }
    const totalObjetivo = 46;
    const logsPlan = construirLogsScraping(totalObjetivo, fuenteSeleccionada.id);
    const opiniones = generarOpiniones(totalObjetivo, fuenteSeleccionada.nombre);

    setEjecutando(true);
    setResultado(null);
    setLogs([]);
    setLineaActual(0);
    setProgreso(0);
    setExtraidos(0);
    setNuevos(0);
    setPendientes(totalObjetivo);

    let indice = 0;
    temporizador.current = setInterval(() => {
      indice++;
      setLineaActual(indice);
      setLogs(logsPlan.slice(0, indice));
      setProgreso(Math.round((indice / logsPlan.length) * 100));

      const linea = logsPlan[indice - 1];
      if (linea?.texto.startsWith('Opinión extraída')) {
        const n = opiniones.length;
        setExtraidos((v) => v + 1);
        setNuevos((v) => v + Math.max(1, Math.round(v / 4)));
        setPendientes((v) => Math.max(0, v - 1));
      }

      if (indice >= logsPlan.length) {
        limpiarTemporizador();
        setEjecutando(false);
        setResultado(opiniones);
        setNuevos(38);
        setPendientes(0);
        toast.success('Recopilación finalizada correctamente.');
      }
    }, intervaloMs);
  }

  function descargarDataset() {
    if (!resultado || resultado.length === 0) return;
    descargarCSV(
      'dataset_crudo.csv',
      ['id', 'fuente', 'texto', 'fecha'],
      resultado.map((o) => [o.id, o.fuente, o.texto, o.fecha])
    );
    toast.success('Dataset crudo descargado.');
  }

  if (cargandoAuth) return null;

  if (!rol || !ROLES_PERMITIDOS.includes(rol)) {
    return (
      <div className="emi-empty emi-card">
        <p className="text-sm font-medium text-navy">Acceso restringido</p>
        <p className="mt-1 text-xs">
          Este módulo está disponible para Superadministrador y Administrador.
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        titulo="Ejecutar Scraping"
        subtitulo="Lance recopilaciones de menciones y supervise el proceso en tiempo real."
      />

      <div className="emi-card p-6">
        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label>
              <span className="inline-flex items-center gap-1.5">
                <Rss className="h-3.5 w-3.5" />
                Fuente (solo activas)
              </span>
            </Label>
            <Select value={fuenteId} onValueChange={setFuenteId} disabled={ejecutando}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una fuente" />
              </SelectTrigger>
              <SelectContent>
                {fuentesActivas.length === 0 && (
                  <SelectItem value="vacio" disabled>
                    No hay fuentes activas
                  </SelectItem>
                )}
                {fuentesActivas.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.id} · {PLATAFORMA_LABEL[f.plataforma]} — {f.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desde">
              <span className="inline-flex items-center gap-1.5">
                <CalendarRange className="h-3.5 w-3.5" />
                Desde
              </span>
            </Label>
            <Input
              id="desde"
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              disabled={ejecutando}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hasta">Hasta</Label>
            <Input
              id="hasta"
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              disabled={ejecutando}
            />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            onClick={iniciar}
            disabled={ejecutando || !fuenteSeleccionada}
            className="emi-btn-primary h-10 rounded-xl px-6 font-semibold"
          >
            <Play className="mr-2 h-4 w-4" />
            {ejecutando ? 'Recopilando...' : 'Iniciar recopilación'}
          </Button>
          {resultado && !ejecutando && (
            <Button
              variant="outline"
              onClick={descargarDataset}
              className="h-10 rounded-xl font-semibold"
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar dataset crudo (CSV)
            </Button>
          )}
        </div>
      </div>

      {(ejecutando || logs.length > 0) && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { etiqueta: 'Extraídos', valor: extraidos, color: '#1f6feb' },
              { etiqueta: 'Nuevos', valor: nuevos, color: '#2e9e6b' },
              { etiqueta: 'Pendientes', valor: pendientes, color: '#e0a100' },
            ].map((m) => (
              <div key={m.etiqueta} className="emi-card p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {m.etiqueta}
                </p>
                <p className="mt-1 text-3xl font-bold" style={{ color: m.color }}>
                  {m.valor}
                </p>
              </div>
            ))}
          </div>

          <div className="emi-card p-6">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-medium text-navy">Progreso de la recopilación</span>
              <span className="text-muted-foreground">{progreso}%</span>
            </div>
            <BarraProgreso valor={progreso} />
            <div className="mt-5">
              <TerminalLogs lineas={logs} />
            </div>
          </div>
        </div>
      )}

      {resultado && !ejecutando && (
        <div className="emi-card mt-6 p-6">
          <h2 className="text-base font-semibold text-navy">Resumen</h2>
          <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <p>
              Fuente: <span className="font-medium text-navy">{resultado[0]?.fuente}</span>
            </p>
            <p>
              Rango de fechas: <span className="font-medium text-navy">{desde} a {hasta}</span>
            </p>
            <p>
              Registros recopilados: <span className="font-medium text-navy">{resultado.length}</span>{' '}
              (aprox. {resultado.filter((o) => o.texto.length > 0).length} válidos,{' '}
              {nuevos} nuevos, 0 duplicados relevantes)
            </p>
          </div>
          <div className="mt-4">
            <TerminalLogs
              lineas={[
                { texto: `Recopilación finalizada con ${resultado.length} registros`, tipo: 'exito' },
                { texto: 'Dataset crudo listo para descargar y para el módulo PLN', tipo: 'info' },
              ]}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              onClick={descargarDataset}
              className="emi-btn-primary h-10 rounded-xl px-6 font-semibold"
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar dataset crudo (CSV)
            </Button>
            <Button
              variant="outline"
              className="h-10 rounded-xl font-semibold"
              onClick={() => {
                setLogs([]);
                setResultado(null);
                setProgreso(0);
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Nueva recopilación
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
