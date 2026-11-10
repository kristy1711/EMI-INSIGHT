'use client';

import { toast } from 'sonner';
import { Info, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePln } from '@/contexts/PlnContext';
import { RESULTADOS_ESPERADOS } from '@/services/pln.service';
import { descargarCSV } from '@/lib/csv';

export default function PasoResultados({
  habilitado,
  onGuardar,
  onReiniciar,
}: {
  habilitado: boolean;
  onGuardar: () => void;
  onReiniciar: () => void;
}) {
  const { guardar } = usePln();

  function guardarAnalisis() {
    if (!habilitado) return;
    const resultados = {
      ...RESULTADOS_ESPERADOS,
      generadoEn: new Date().toISOString(),
    };
    guardar(resultados);
    toast.success('Análisis guardado. Los resultados ya están disponibles en el Dashboard y la búsqueda.');
    onGuardar();
  }

  function reiniciar() {
    onReiniciar();
    toast.success('Pipeline reiniciado.');
  }

  function exportarCsv() {
    descargarCSV(
      'analisis_pln.csv',
      ['factor', 'porcentaje', 'cantidad', 'terminos'],
      RESULTADOS_ESPERADOS.factores.map((f) => [
        f.nombre,
        String(f.porcentaje),
        String(f.cantidad),
        f.terminos.join(', '),
      ])
    );
    toast.success('CSV del análisis descargado.');
  }

  return (
    <div className="space-y-6">
      <div className="emi-card border-l-4 p-6" style={{ borderLeftColor: '#1f6feb' }}>
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-emiblue" />
          <div>
            <h2 className="text-base font-semibold text-navy">Resumen ejecutivo</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              El análisis de 172 opiniones válidas identificó una percepción mayoritariamente
              positiva (41,9%) y neutral (37,2%), con un 20,9% de menciones negativas. Mediante
              modelado temático se identificaron 7 factores de percepción, destacando la
              <span className="font-semibold"> gestión administrativa (22,9%)</span> y la
              <span className="font-semibold"> calidad académica (19,1%)</span> como las principales
              fuentes de insatisfacción. El clasificador BETO alcanzó un F1-Score de 0,824,
              superando el umbral de cumplimiento de 0,75.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { etiqueta: 'F1-Score', valor: '0.824' },
          { etiqueta: 'Precisión', valor: '0.831' },
          { etiqueta: 'Recall', valor: '0.817' },
          { etiqueta: 'CV Score BERTopic', valor: '0.68' },
        ].map((m) => (
          <div key={m.etiqueta} className="emi-card p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {m.etiqueta}
            </p>
            <p className="mt-1 text-3xl font-bold text-navy">{m.valor}</p>
          </div>
        ))}
      </div>

      <div className="emi-card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-navy">
            Factores identificados (7)
          </h2>
          <Badge
            className={
              RESULTADOS_ESPERADOS.metricasBeto.f1 >= 0.75
                ? 'border-transparent bg-[#2e9e6b]/15 text-[#2e9e6b]'
                : 'border-transparent bg-[#d64545]/15 text-[#d64545]'
            }
          >
            Modelo BETO: Cumple (F1 ≥ 0.75)
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RESULTADOS_ESPERADOS.factores.map((f, i) => (
            <div key={f.nombre} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-navy">{f.nombre}</p>
                <span className="text-sm font-bold text-emiblue">{f.porcentaje}%</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {f.cantidad} opiniones negativas asociadas
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="emi-card flex flex-wrap justify-end gap-3 p-6">
        <Button
          variant="outline"
          className="h-10 rounded-xl font-semibold"
          onClick={reiniciar}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reiniciar pipeline
        </Button>
        <Button
          variant="outline"
          className="h-10 rounded-xl font-semibold"
          onClick={exportarCsv}
          disabled={!habilitado}
        >
          Descargar CSV
        </Button>
        <Button
          onClick={guardarAnalisis}
          disabled={!habilitado}
          className="emi-btn-primary h-10 rounded-xl px-6 font-semibold"
        >
          <Save className="mr-2 h-4 w-4" />
          Guardar análisis (CSV)
        </Button>
      </div>
    </div>
  );
}
