'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { FileText, Download, Eye, Save } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getAnalisisConsolidado, fuentesDisponibles } from '@/services/analisis.service';
import { guardarReporte, type ReporteGuardado } from '@/services/historial.service';
import { descargarCSV } from '@/lib/csv';
import { generarPdfReporte } from '@/lib/pdf';

const SECCIONES = [
  { id: 'resumen', etiqueta: 'Resumen ejecutivo' },
  { id: 'metricas', etiqueta: 'Métricas del modelo' },
  { id: 'factores', etiqueta: 'Factores de percepción' },
  { id: 'recomendaciones', etiqueta: 'Recomendaciones' },
];

export default function ReportesPage() {
  const { usuario } = useAuth();
  const analisis = getAnalisisConsolidado();
  const fuentes = fuentesDisponibles();

  const [titulo, setTitulo] = useState('Reporte de percepción institucional');
  const [periodo, setPeriodo] = useState('Noviembre 2026');
  const [fuente, setFuente] = useState('todas');
  const [destinatario, setDestinatario] = useState('Dirección Académica');
  const [formato, setFormato] = useState<'pdf' | 'csv'>('pdf');
  const [secciones, setSecciones] = useState<string[]>(['resumen', 'metricas', 'factores', 'recomendaciones']);

  function toggleSeccion(id: string) {
    setSecciones((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  const fuenteLabel = fuente === 'todas'
    ? 'Todas las fuentes'
    : fuentes.find((f) => f.id === fuente)?.nombre ?? fuente;

  function crearReporte(): ReporteGuardado {
    return {
      id: `rep-${Date.now().toString(36)}`,
      titulo,
      fecha: new Date().toISOString(),
      autor: usuario?.nombre ?? 'Sistema',
      periodo,
      fuente: fuenteLabel,
      formato,
      secciones,
    };
  }

  function generar() {
    if (!titulo.trim()) {
      toast.error('Ingrese un título para el reporte.');
      return;
    }
    if (secciones.length === 0) {
      toast.error('Seleccione al menos una sección.');
      return;
    }
    const reporte = crearReporte();

    if (formato === 'pdf') {
      const doc = generarPdfReporte({
        titulo,
        periodo,
        fuente: fuenteLabel,
        destinatario,
        secciones,
        analisis,
        autor: usuario?.nombre ?? 'Sistema',
      });
      doc.save(`${titulo.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    } else {
      descargarCSV(
        `${titulo.replace(/\s+/g, '_').toLowerCase()}.csv`,
        ['factor', 'porcentaje', 'cantidad', 'terminos'],
        analisis.resultados.factores.map((f) => [
          f.nombre,
          String(f.porcentaje),
          String(f.cantidad),
          f.terminos.join(', '),
        ])
      );
    }

    guardarReporte(reporte);
    toast.success(`Reporte "${titulo}" generado y guardado en el historial.`);
  }

  const r = analisis.resultados;

  return (
    <AppLayout>
      <PageHeader
        titulo="Generar Reportes"
        subtitulo="Cree documentos institucionales con diseño profesional y secciones a medida."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Formulario */}
        <div className="emi-card p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Columna 1 */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-navy">Datos del reporte</h2>
              <div className="space-y-1.5">
                <Label htmlFor="rtitulo">Título</Label>
                <Input
                  id="rtitulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rperiodo">Periodo</Label>
                <Input
                  id="rperiodo"
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Fuente</Label>
                <Select value={fuente} onValueChange={setFuente}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las fuentes</SelectItem>
                    {fuentes.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Columna 2 */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-navy">Salida y secciones</h2>
              <div className="space-y-1.5">
                <Label htmlFor="rdest">Destinatario</Label>
                <Input
                  id="rdest"
                  value={destinatario}
                  onChange={(e) => setDestinatario(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Formato de salida</Label>
                <Select value={formato} onValueChange={(v) => setFormato(v as 'pdf' | 'csv')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Secciones a incluir</Label>
                <div className="space-y-2">
                  {SECCIONES.map((s) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`sec-${s.id}`}
                        checked={secciones.includes(s.id)}
                        onCheckedChange={() => toggleSeccion(s.id)}
                      />
                      <Label htmlFor={`sec-${s.id}`} className="text-sm font-normal cursor-pointer">
                        {s.etiqueta}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="mt-6 flex justify-end border-t border-border pt-5">
            <Button
              onClick={generar}
              className="emi-btn-primary h-10 rounded-xl px-6 font-semibold"
            >
              <Download className="mr-2 h-4 w-4" />
              Generar reporte
            </Button>
          </div>
        </div>

        {/* Vista previa */}
        <div className="emi-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Eye className="h-4 w-4 text-emiblue" />
            <h2 className="text-sm font-semibold text-navy">Vista previa del documento</h2>
          </div>

          {/* Encabezado simulado */}
          <div className="rounded-t-xl px-5 py-4 text-white" style={{ backgroundColor: '#0b2545' }}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold">EMI-UALP</p>
            <p className="text-sm font-bold">{titulo}</p>
            <p className="mt-1 text-[11px] text-white/70">
              {periodo} · {fuenteLabel} · {destinatario}
            </p>
          </div>
          <div className="h-1 rounded-b-none" style={{ backgroundColor: '#c9a227' }} />

          <div className="rounded-b-xl border border-t-0 border-border p-5 space-y-4">
            {secciones.includes('resumen') && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-navy">
                  Resumen ejecutivo
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Análisis de {r.corpus.validos} opiniones válidas. Percepción positiva{' '}
                  {r.sentimientos.positivo}%, neutral {r.sentimientos.neutral}%, negativa{' '}
                  {r.sentimientos.negativo}%. Se identificaron {r.factores.length} factores
                  de percepción.
                </p>
              </div>
            )}

            {secciones.includes('metricas') && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-navy">
                  Métricas del modelo
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge className="border-transparent bg-navy/10 text-navy text-[10px]">
                    F1: {r.metricasBeto.f1}
                  </Badge>
                  <Badge className="border-transparent bg-navy/10 text-navy text-[10px]">
                    Precisión: {r.metricasBeto.precision}
                  </Badge>
                  <Badge className="border-transparent bg-navy/10 text-navy text-[10px]">
                    Recall: {r.metricasBeto.recall}
                  </Badge>
                </div>
              </div>
            )}

            {secciones.includes('factores') && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-navy">
                  Factores identificados
                </p>
                <div className="mt-1.5 space-y-1">
                  {r.factores.slice(0, 4).map((f) => (
                    <div key={f.nombre} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{f.nombre}</span>
                      <span className="font-semibold text-emiblue">{f.porcentaje}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {secciones.includes('recomendaciones') && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-navy">
                  Recomendaciones
                </p>
                <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                  <li>• Optimizar procesos de inscripción y trámites administrativos.</li>
                  <li>• Mejorar canales de comunicación con estudiantes.</li>
                  <li>• Renovar infraestructura de laboratorios antiguos.</li>
                </ul>
              </div>
            )}

            <div className="border-t border-border pt-3">
              <p className="text-[10px] text-muted-foreground">
                Formato: {formato.toUpperCase()} · Generado por{' '}
                {usuario?.nombre ?? 'Sistema'} · {new Date().toLocaleDateString('es-BO')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
