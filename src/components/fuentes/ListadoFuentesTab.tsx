'use client';

import { useState } from 'react';
import {
  Facebook,
  MapPin,
  Link2,
  Trash2,
  Info,
  Globe,
  Tag,
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useFuentes } from '@/contexts/FuentesContext';
import { PLATAFORMA_LABEL, TIPO_INFO_LABEL, type Fuente } from '@/types/fuentes';

const PLATAFORMA_ESTILO = {
  facebook: { icono: Facebook, color: '#1877F2', fondo: '#1877F2' },
  google_maps: { icono: MapPin, color: '#2e9e6b', fondo: '#2e9e6b' },
} as const;

function TarjetaFuente({
  fuente,
  seleccionada,
  onSeleccionar,
}: {
  fuente: Fuente;
  seleccionada: boolean;
  onSeleccionar: () => void;
}) {
  const estilo = PLATAFORMA_ESTILO[fuente.plataforma];
  const Icono = estilo.icono;
  return (
    <button
      type="button"
      onClick={onSeleccionar}
      className={`emi-card p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        seleccionada ? 'ring-2 ring-emiblue' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: estilo.fondo }}
        >
          <Icono className="h-5 w-5 text-white" />
        </div>
        <Badge
          className={
            fuente.activa
              ? 'border-transparent bg-[#2e9e6b]/15 text-[#2e9e6b]'
              : 'border-transparent bg-muted text-muted-foreground'
          }
          variant="outline"
        >
          {fuente.activa ? 'Activa' : 'Inactiva'}
        </Badge>
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide" style={{ color: estilo.color }}>
        {fuente.id} · {PLATAFORMA_LABEL[fuente.plataforma]}
      </p>
      <h3 className="mt-0.5 font-semibold text-navy">{fuente.nombre}</h3>
      <p className="mt-1 truncate text-xs text-muted-foreground">{fuente.url}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Tipo: {TIPO_INFO_LABEL[fuente.tipoInformacion]}
      </p>
    </button>
  );
}

export default function ListadoFuentesTab() {
  const { fuentes, cambiarEstado, eliminar } = useFuentes();
  const [seleccionId, setSeleccionId] = useState<string | null>(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);

  const seleccionada = fuentes.find((f) => f.id === seleccionId) ?? null;

  const metricas = {
    total: fuentes.length,
    conectadas: fuentes.filter((f) => f.activa).length,
    facebook: fuentes.filter((f) => f.plataforma === 'facebook').length,
    googleMaps: fuentes.filter((f) => f.plataforma === 'google_maps').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { etiqueta: 'Total de fuentes', valor: metricas.total, color: '#0b2545' },
          { etiqueta: 'Conectadas', valor: metricas.conectadas, color: '#2e9e6b' },
          { etiqueta: 'Facebook', valor: metricas.facebook, color: '#1877F2' },
          { etiqueta: 'Google Maps', valor: metricas.googleMaps, color: '#c9a227' },
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

      {fuentes.length === 0 ? (
        <div className="emi-empty emi-card">
          <Globe className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium">No hay fuentes configuradas</p>
          <p className="mt-1 text-xs">
            Cree una fuente en la pestaña "Nueva fuente".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {fuentes.map((f) => (
            <TarjetaFuente
              key={f.id}
              fuente={f}
              seleccionada={seleccionId === f.id}
              onSeleccionar={() =>
                setSeleccionId(seleccionId === f.id ? null : f.id)
              }
            />
          ))}
        </div>
      )}

      {seleccionada && (
        <div className="emi-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Info className="h-4 w-4 text-emiblue" />
            <h2 className="text-base font-semibold text-navy">
              Detalles de la fuente {seleccionada.id}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Tag className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium text-navy">{seleccionada.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {PLATAFORMA_LABEL[seleccionada.plataforma]} ·{' '}
                    {TIPO_INFO_LABEL[seleccionada.tipoInformacion]}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <a
                  href={seleccionada.url}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-emiblue hover:underline"
                >
                  {seleccionada.url}
                </a>
              </div>
              {seleccionada.descripcion && (
                <p className="text-xs text-muted-foreground">
                  {seleccionada.descripcion}
                </p>
              )}
            </div>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <Switch
                  checked={seleccionada.activa}
                  onCheckedChange={(v) => cambiarEstado(seleccionada.id, v)}
                  id="switch-fuente"
                />
                <Label htmlFor="switch-fuente" className="text-sm">
                  {seleccionada.activa ? 'Fuente activa' : 'Fuente inactiva'}
                </Label>
              </div>
              <Button
                variant="outline"
                className="rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setConfirmarEliminar(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar fuente
              </Button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={confirmarEliminar} onOpenChange={setConfirmarEliminar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar fuente</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Confirma eliminar la fuente "{seleccionada?.nombre}" ({seleccionada?.id})?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (seleccionada) eliminar(seleccionada.id);
                setSeleccionId(null);
                setConfirmarEliminar(false);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
