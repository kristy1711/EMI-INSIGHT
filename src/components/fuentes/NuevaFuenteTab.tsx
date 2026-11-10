'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Globe, FileText } from 'lucide-react';
import { useFuentes } from '@/contexts/FuentesContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PLATAFORMA_LABEL,
  TIPO_INFO_LABEL,
  type Plataforma,
  type TipoInformacion,
} from '@/types/fuentes';

const PLATAFORMAS: Plataforma[] = ['facebook', 'google_maps'];
const TIPOS: TipoInformacion[] = ['publicaciones', 'comentarios', 'resenas'];

function urlValida(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export default function NuevaFuenteTab() {
  const { crear } = useFuentes();
  const [plataforma, setPlataforma] = useState<Plataforma | ''>('');
  const [nombre, setNombre] = useState('');
  const [url, setUrl] = useState('');
  const [tipo, setTipo] = useState<TipoInformacion | ''>('');
  const [descripcion, setDescripcion] = useState('');
  const [activar, setActivar] = useState(true);
  const [errores, setErrores] = useState<Record<string, string>>({});

  function validar(): boolean {
    const nuevos: Record<string, string> = {};
    if (!plataforma) nuevos.plataforma = 'Seleccione una plataforma';
    if (!nombre.trim()) nuevos.nombre = 'Ingrese el nombre de la cuenta';
    if (!url.trim()) {
      nuevos.url = 'Ingrese la URL';
    } else if (!urlValida(url.trim())) {
      nuevos.url = 'Ingrese una URL válida (comienza con http:// o https://)';
    }
    if (!tipo) nuevos.tipo = 'Seleccione el tipo de información';
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validar()) return;
    const nueva = crear({
      plataforma: plataforma as Plataforma,
      nombre: nombre.trim(),
      url: url.trim(),
      tipoInformacion: tipo as TipoInformacion,
      descripcion: descripcion.trim() || undefined,
      activa: activar,
    });
    toast.success(`Fuente ${nueva.id} creada correctamente.`);
    setPlataforma('');
    setNombre('');
    setUrl('');
    setTipo('');
    setDescripcion('');
    setActivar(true);
    setErrores({});
  }

  function ErrorCampo({ campo }: { campo: string }) {
    const mensaje = errores[campo];
    if (!mensaje) return null;
    return <p className="mt-1 text-xs text-destructive">{mensaje}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="emi-card p-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-emiblue" />
            <h2 className="text-base font-semibold text-navy">Origen de datos</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Plataforma</Label>
              <Select
                value={plataforma}
                onValueChange={(v) => setPlataforma(v as Plataforma)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  {PLATAFORMAS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PLATAFORMA_LABEL[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ErrorCampo campo="plataforma" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fnombre">Nombre de la cuenta</Label>
              <Input
                id="fnombre"
                placeholder="p. ej. EMI Oficial"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <ErrorCampo campo="nombre" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="furl">URL</Label>
              <Input
                id="furl"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <ErrorCampo campo="url" />
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-emiblue" />
            <h2 className="text-base font-semibold text-navy">
              Información a recopilar
            </h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tipo de información</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoInformacion)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIPO_INFO_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ErrorCampo campo="tipo" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fdesc">Descripción (opcional)</Label>
              <Textarea
                id="fdesc"
                placeholder="Detalles sobre la fuente, alcance, consideraciones..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
              <Switch checked={activar} onCheckedChange={setActivar} id="factivar" />
              <Label htmlFor="factivar" className="text-sm font-normal">
                Activar inmediatamente
              </Label>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 flex justify-end border-t border-border pt-5">
        <Button
          type="submit"
          className="emi-btn-primary h-10 rounded-xl px-6 font-semibold"
        >
          Guardar fuente
        </Button>
      </div>
    </form>
  );
}
