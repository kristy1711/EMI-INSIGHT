'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  FileText,
  Download,
  Trash2,
  ChevronDown,
  FileSpreadsheet,
  Inbox,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  getReportes,
  eliminarReporte,
  type ReporteGuardado,
} from '@/services/historial.service';
import { getAnalisisConsolidado } from '@/services/analisis.service';
import { descargarCSV } from '@/lib/csv';
import { descargarPdf } from '@/lib/pdf';

export default function HistorialPage() {
  const { usuario } = useAuth();
  const [reportes, setReportes] = useState<ReporteGuardado[]>([]);
  const [aEliminar, setAEliminar] = useState<ReporteGuardado | null>(null);

  function refrescar() {
    setReportes(getReportes());
  }

  useEffect(() => {
    refrescar();
  }, []);

  function handleEliminar() {
    if (!aEliminar) return;
    eliminarReporte(aEliminar.id);
    setAEliminar(null);
    refrescar();
    toast.success('Reporte eliminado del historial.');
  }

  function descargar(r: ReporteGuardado) {
    const analisis = getAnalisisConsolidado();
    if (r.formato === 'pdf') {
      descargarPdf(r, analisis, usuario?.nombre ?? 'Sistema');
    } else {
      descargarCSV(
        `${r.titulo.replace(/\s+/g, '_').toLowerCase()}.csv`,
        ['factor', 'porcentaje', 'cantidad', 'terminos'],
        analisis.resultados.factores.map((f) => [
          f.nombre,
          String(f.porcentaje),
          String(f.cantidad),
          f.terminos.join(', '),
        ])
      );
    }
    toast.success(`Descargando "${r.titulo}".`);
  }

  return (
    <AppLayout>
      <PageHeader
        titulo="Gestionar Historial"
        subtitulo="Revise, descargue o elimine los reportes generados anteriormente."
      />

      {reportes.length === 0 ? (
        <div className="emi-empty emi-card">
          <Inbox className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium">No hay reportes generados</p>
          <p className="mt-1 text-xs">
            Los reportes que genere desde la sección "Generar Reportes" aparecerán aquí.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {reportes.length} reporte(s) en el historial
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {reportes.map((r) => (
              <AccordionItem
                key={r.id}
                value={r.id}
                className="emi-card overflow-hidden border-0 px-5"
              >
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex flex-1 items-center gap-4 pr-4 text-left">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor:
                          r.formato === 'pdf' ? '#d6454515' : '#2e9e6b15',
                      }}
                    >
                      {r.formato === 'pdf' ? (
                        <FileText className="h-5 w-5 text-[#d64545]" />
                      ) : (
                        <FileSpreadsheet className="h-5 w-5 text-[#2e9e6b]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-navy">{r.titulo}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {new Date(r.fecha).toLocaleDateString('es-BO', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}{' '}
                        · {r.autor} · {r.periodo} · {r.fuente}
                      </p>
                    </div>
                    <Badge
                      className="shrink-0 border-transparent"
                      style={{
                        backgroundColor: r.formato === 'pdf' ? '#d6454515' : '#2e9e6b15',
                        color: r.formato === 'pdf' ? '#d64545' : '#2e9e6b',
                      }}
                    >
                      {r.formato.toUpperCase()}
                    </Badge>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-5 pt-2">
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Autor
                        </p>
                        <p className="text-navy">{r.autor}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Periodo
                        </p>
                        <p className="text-navy">{r.periodo}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Fuente
                        </p>
                        <p className="text-navy">{r.fuente}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Formato
                        </p>
                        <p className="text-navy">{r.formato.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Secciones incluidas
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {r.secciones.map((s) => (
                          <Badge
                            key={s}
                            variant="outline"
                            className="border-border text-muted-foreground text-[10px]"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg font-semibold"
                        onClick={() => descargar(r)}
                      >
                        <Download className="mr-1.5 h-4 w-4" />
                        Descargar {r.formato.toUpperCase()}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg border-destructive/40 font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setAEliminar(r)}
                      >
                        <Trash2 className="mr-1.5 h-4 w-4" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </>
      )}

      <AlertDialog
        open={aEliminar !== null}
        onOpenChange={(abierto) => !abierto && setAEliminar(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar reporte</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Confirma eliminar el reporte "{aEliminar?.titulo}" del historial?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleEliminar}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
